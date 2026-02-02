"""
Quantized layers for True Q4 inference.
Keeps weights in Q4_K format (144 bytes per 256 elements) instead of FP16 (512 bytes per 256 elements).
This saves ~3.5x VRAM, allowing 14B models to fit in 20GB.

Memory comparison for Qwen2.5-14B:
- FP16: 27.5 GB (doesn't fit in 20GB)
- Q4_K: ~8 GB (fits easily!)
"""

from tinygrad import Tensor, dtypes
from tinygrad.helpers import prod
from tinygrad.nn.state import dequant_q4k_tensor

class QuantizedLinear:
    """
    Linear layer that stores weights in Q4_K format and dequantizes on-the-fly.

    Q4_K format: 256 elements per 144-byte block
    - d: 2 bytes (float16 scale)
    - dmin: 2 bytes (float16 min)
    - scales: 12 bytes (6-bit scales/mins packed)
    - qs: 128 bytes (4-bit quantized values, 256 elements)

    Memory: 144 bytes per 256 elements = 0.5625 bytes/element
    vs FP16: 2 bytes/element = 3.55x savings
    """

    def __init__(self, in_features: int, out_features: int, bias: bool = False):
        self.in_features = in_features
        self.out_features = out_features
        self.has_bias = bias

        # Will be filled by load_q4k_blocks OR by setting weight directly
        self.q4_blocks: Tensor | None = None  # Raw Q4_K blocks
        self.weight: Tensor | None = None     # FP16 weights (for Q6_K or other non-Q4K)
        self.bias_tensor: Tensor | None = None
        self.n_elements = out_features * in_features

    def load_q4k_blocks(self, blocks: Tensor, bias: Tensor | None = None):
        """Load raw Q4_K blocks without dequantizing."""
        self.q4_blocks = blocks
        if bias is not None:
            self.bias_tensor = bias

    @staticmethod
    def dequant_q4k(blocks: Tensor, n: int) -> Tensor:
        """
        Dequantize Q4_K blocks to float16.
        This is called on-the-fly during forward pass.

        Args:
            blocks: Raw Q4_K blocks, shape (num_blocks, 144)
            n: Total number of elements

        Returns:
            Dequantized tensor of shape (n,) in float16
        """
        def q_to_uint8(t: Tensor, b: int) -> Tensor:
            """Convert packed bits to uint8."""
            shift_tensor = Tensor.stack(*[Tensor(2**(i*b), device=t.device, dtype=t.dtype) for i in range(8//b)])
            bitmask = 0xff >> (8 - b)
            return t.unsqueeze(-1).expand((*t.shape, 8//b)).idiv(shift_tensor).bitwise_and(bitmask).transpose(-1, -2).flatten(-2)

        # Q4_K: 256 elements per 144-byte block
        # Layout: d(2), dmin(2), scales(12), qs(128)
        d = blocks[:, 0:2].bitcast(dtypes.float16).cast(dtypes.float32).unsqueeze(-1)
        dmin = blocks[:, 2:4].bitcast(dtypes.float16).cast(dtypes.float32).unsqueeze(-1)

        # Scales and mins (6-bit packed in 12 bytes)
        s = blocks[:, 4:16]
        sc = s[:, 0:4].bitwise_and(63).cat(s[:, 8:12].bitwise_and(0xF).bitwise_or(s[:, 0:4].rshift(6).lshift(4)), dim=-1)
        mn = s[:, 4:8].bitwise_and(63).cat(s[:, 8:12].rshift(4).bitwise_or(s[:, 4:8].rshift(6).lshift(4)), dim=-1)

        # Quantized values (4-bit packed in 128 bytes = 256 values)
        qs = blocks[:, 16:144].reshape(-1, 4, 32)
        q = Tensor.stack(qs.bitwise_and(0xF), qs.rshift(4), dim=2).reshape(-1, 8, 32).cast(dtypes.float32)

        # Dequantize: (d * scale * q) - (dmin * min)
        result = (d * sc.unsqueeze(-1) * q - dmin * mn.unsqueeze(-1)).flatten(-2)
        return result.cast(dtypes.float16)[:n]

    def __call__(self, x: Tensor) -> Tensor:
        """
        Forward pass with on-the-fly dequantization (for Q4_K) or direct matmul (for FP16).

        The weight tensor is dequantized just before matmul, then the dequantized
        weights can be freed after the operation (not stored).
        """
        if self.q4_blocks is not None:
            # Dequantize Q4_K weights on-the-fly using TinyGrad's implementation
            # dequant_q4k_tensor returns (num_blocks, 256), need to flatten properly
            weight = dequant_q4k_tensor(self.q4_blocks, self.n_elements)
            weight = weight.flatten()[:self.n_elements].reshape(self.out_features, self.in_features)
        elif self.weight is not None:
            # Use FP16 weights directly (for Q6_K or other formats)
            weight = self.weight
        else:
            raise ValueError("Weights not loaded. Call load_q4k_blocks or set weight.")

        # Standard linear: x @ W.T + b
        out = x @ weight.T
        if self.bias_tensor is not None:
            out = out + self.bias_tensor
        return out


def estimate_memory(num_params: int) -> dict:
    """Estimate memory for different formats."""
    fp16_bytes = num_params * 2
    # Q4_K: 144 bytes per 256 elements
    q4k_bytes = (num_params // 256) * 144

    return {
        "params": num_params,
        "fp16_gb": fp16_bytes / 1024**3,
        "q4k_gb": q4k_bytes / 1024**3,
        "savings_gb": (fp16_bytes - q4k_bytes) / 1024**3,
        "ratio": fp16_bytes / q4k_bytes if q4k_bytes > 0 else 0
    }


if __name__ == "__main__":
    # Test memory estimates
    print("=== Memory Estimates ===")
    for name, params in [("7B", 7_000_000_000), ("14B", 14_000_000_000)]:
        est = estimate_memory(params)
        print(f"{name}: FP16={est['fp16_gb']:.1f}GB, Q4K={est['q4k_gb']:.1f}GB, Savings={est['savings_gb']:.1f}GB ({est['ratio']:.1f}x)")
