"""
LLM with layer offloading for models that don't fit in VRAM.

For Qwen2.5-14B on 20GB VRAM:
- FP16 model = 27.5 GB (doesn't fit)
- With offload: keep 32 blocks in VRAM, swap 16 blocks from RAM
"""

import os, sys
from tinygrad import Tensor, dtypes, Device, nn
from tinygrad.helpers import GlobalCounters, getenv

def load_model_with_offload(model_path: str, max_vram_gb: float = 19.0, max_context: int = 256):
    """
    Load a model with layer offloading.
    Keeps as many blocks as fit in VRAM, offloads rest to CPU.
    """
    from llm import Transformer, SimpleTokenizer

    # Load model structure (lazy)
    gguf = Tensor.empty(os.stat(model_path).st_size, dtype=dtypes.uint8, device=f'disk:{model_path}')
    model, kv = Transformer.from_gguf(gguf.to(None), max_context=max_context, realize=False)
    tokenizer = SimpleTokenizer.from_gguf_kv(kv)

    # Get state dict
    state = nn.state.get_state_dict(model)

    # Calculate sizes
    block_count = kv.get(f'{kv["general.architecture"]}.block_count', 48)
    other_params = {k: v for k, v in state.items() if 'blk.' not in k}
    other_size = sum(v.numel() * 2 for v in other_params.values())  # FP16

    block_params = {}
    for i in range(block_count):
        block_params[i] = {k: v for k, v in state.items() if f'blk.{i}.' in k}

    single_block_size = sum(v.numel() * 2 for v in block_params[0].values())
    max_vram_bytes = max_vram_gb * 1024**3

    # Calculate how many blocks fit in VRAM
    available_for_blocks = max_vram_bytes - other_size
    blocks_in_vram = int(available_for_blocks / single_block_size)
    blocks_in_vram = min(blocks_in_vram, block_count)  # Cap at total blocks

    print(f"=== Offload Strategy ===")
    print(f"Model: {kv['general.architecture']} with {block_count} blocks")
    print(f"Other params: {other_size / 1024**3:.2f} GB")
    print(f"Single block: {single_block_size / 1024**3:.3f} GB")
    print(f"Max VRAM: {max_vram_gb} GB")
    print(f"Blocks in VRAM: {blocks_in_vram}")
    print(f"Blocks offloaded: {block_count - blocks_in_vram}")
    print()

    # Realize params in batches
    print("Realizing embeddings and output layers...")
    for name, param in other_params.items():
        param.realize()
    print(f"VRAM after embeddings: {GlobalCounters.mem_used / 1024**3:.2f} GB")

    # Realize blocks that fit in VRAM
    for i in range(blocks_in_vram):
        print(f"Realizing block {i}...", end=" ")
        for name, param in block_params[i].items():
            param.realize()
        print(f"VRAM: {GlobalCounters.mem_used / 1024**3:.2f} GB")

    # Mark remaining blocks for offload (keep lazy, will be realized on CPU later)
    offload_blocks = list(range(blocks_in_vram, block_count))
    print(f"\nBlocks {offload_blocks[0]}-{offload_blocks[-1]} will be offloaded to CPU during inference")

    return model, tokenizer, kv, {
        'blocks_in_vram': blocks_in_vram,
        'offload_blocks': offload_blocks,
        'block_params': block_params
    }


if __name__ == "__main__":
    model_path = '/Volumes/DATI-SSD/llm-models/Qwen2.5-14B-Instruct-Q4_K_M.gguf'

    if not os.path.exists(model_path):
        print(f"Model not found: {model_path}")
        sys.exit(1)

    Device['AMD']
    sys.path.insert(0, os.path.dirname(__file__))

    try:
        model, tokenizer, kv, offload_info = load_model_with_offload(
            model_path,
            max_vram_gb=19.0,
            max_context=128
        )
        print("\n=== Model loaded with offloading! ===")
        print(f"Final VRAM: {GlobalCounters.mem_used / 1024**3:.2f} GB")
    except MemoryError as e:
        print(f"\nOOM Error: {e}")
    except Exception as e:
        print(f"\nError: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
