"""
Quantized Linear layer that keeps weights in Q4_K format and de-quantizes on-the-fly.
This saves ~4x VRAM compared to FP16.

For Qwen2.5-14B:
- FP16: ~28 GB (doesn't fit in 20GB)
- Q4_K: ~8 GB (fits in 20GB!)
"""

from tinygrad import Tensor, dtypes
from tinygrad.helpers import getenv

class QuantizedLinear:
  """
  Linear layer that stores weights in Q4_K format and de-quantizes during forward pass.

  Q4_K format: 256 elements per 144-byte block
  - d: 2 bytes (float16 scale)
  - dmin: 2 bytes (float16 min)
  - scales: 12 bytes (6-bit scales/mins)
  - qs: 128 bytes (4-bit quantized values)
  """

  def __init__(self, in_features: int, out_features: int, bias: bool = False):
    self.in_features = in_features
    self.out_features = out_features
    self.has_bias = bias

    # Placeholder - will be filled by load_quantized_weights
    self.q4_blocks = None  # Raw Q4_K blocks
    self.bias_tensor = None

  def load_q4_blocks(self, blocks: Tensor, bias: Tensor = None):
    """Load raw Q4_K blocks without de-quantizing."""
    self.q4_blocks = blocks
    if bias is not None:
      self.bias_tensor = bias

  def dequant_q4k(self, blocks: Tensor, n: int) -> Tensor:
    """De-quantize Q4_K blocks to float16 on-the-fly."""
    # Q4_K: 256 elements per 144-byte block
    def q_to_uint8(t, b):
      shift_tensor = Tensor.stack(*[Tensor(2**(i*b), device=t.device, dtype=t.dtype) for i in range(8//b)])
      bitmask = 0xff >> (8 - b)
      return t.unsqueeze(-1).expand((*t.shape, 8//b)).idiv(shift_tensor).bitwise_and(bitmask).transpose(-1, -2).flatten(-2)

    d, dmin = (blocks[:,i:i+2].bitcast(dtypes.float16).cast(dtypes.float32).unsqueeze(-1) for i in [0, 2])
    s = blocks[:,4:16]
    sc = s[:,0:4].bitwise_and(63).cat(s[:,8:12].bitwise_and(0xF).bitwise_or(s[:,0:4].rshift(6).lshift(4)), dim=-1)
    mn = s[:,4:8].bitwise_and(63).cat(s[:,8:12].rshift(4).bitwise_or(s[:,4:8].rshift(6).lshift(4)), dim=-1)
    qs = blocks[:,16:144].reshape(-1, 4, 32)
    q = Tensor.stack(qs.bitwise_and(0xF), qs.rshift(4), dim=2).reshape(-1, 8, 32).cast(dtypes.float32)
    return (d * sc.unsqueeze(-1) * q - dmin * mn.unsqueeze(-1)).flatten(-2).cast(dtypes.float16)[:n]

  def __call__(self, x: Tensor) -> Tensor:
    """Forward pass with on-the-fly de-quantization."""
    if self.q4_blocks is None:
      raise ValueError("Weights not loaded. Call load_q4_blocks first.")

    # De-quantize weights just for this forward pass
    # This uses temporary memory that gets freed after matmul
    weight = self.dequant_q4k(self.q4_blocks, self.out_features * self.in_features)
    weight = weight.reshape(self.out_features, self.in_features)

    # Standard linear: x @ W.T + b
    out = x @ weight.T
    if self.bias_tensor is not None:
      out = out + self.bias_tensor
    return out


def estimate_q4_memory(num_params: int) -> dict:
  """Estimate memory usage for Q4 vs FP16."""
  fp16_bytes = num_params * 2
  q4_bytes = (num_params // 256) * 144  # Q4_K: 144 bytes per 256 elements

  return {
    "fp16_gb": fp16_bytes / 1024**3,
    "q4_gb": q4_bytes / 1024**3,
    "savings": (fp16_bytes - q4_bytes) / 1024**3
  }
