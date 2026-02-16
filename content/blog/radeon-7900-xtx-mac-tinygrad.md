# Running AMD Radeon RX 7900 XTX on macOS with TinyGrad: The "Impossible" Setup

*February 2026 — FreeRiverHouse*

## TL;DR

We got a **Radeon RX 7900 XTX (24GB VRAM)** running ML inference on a **MacBook Pro M1** via Thunderbolt eGPU, using **TinyGrad** with a small patch. Everyone said it was impossible. Here's how we did it.

**What works:**
- ✅ GPT-2 inference (~3.6 tok/s)
- ✅ GPT-2 XL (1.5B parameters)
- ✅ LLaMA 3.1 8B (Q4_K_M quantized)
- ✅ Translation models (Helsinki-NLP opus-mt)

## The Problem

Apple Silicon Macs are great, but if you want to run larger ML models, you're limited to the unified memory of your Mac. An M1 has 16GB shared between CPU and GPU — not enough for serious LLM work.

External GPUs (eGPUs) seem like the obvious solution: plug in a powerful desktop GPU via Thunderbolt and get 24GB of dedicated VRAM. But:

1. **Apple dropped eGPU support** in macOS Ventura for Apple Silicon
2. **NVIDIA doesn't work on macOS** at all (no drivers since Mojave)  
3. **AMD Radeon + TinyGrad** on macOS? "Not possible" — said everyone on Discord, Reddit, and GitHub Issues

We proved them wrong.

## Hardware Setup

| Component | Details |
|-----------|---------|
| **GPU** | AMD Radeon RX 7900 XTX (24GB GDDR6) |
| **Enclosure** | Razer Core X V2 (Thunderbolt 3) |
| **Host** | MacBook Pro M1 (2021) |
| **Connection** | Thunderbolt 3/4 |
| **Key Software** | TinyGPU.app (creates virtual USB device) |

### Critical Detail: TinyGPU.app

The magic ingredient is **TinyGPU.app** — a macOS app that creates a virtual device interface, allowing TinyGrad's AMD backend to communicate with the Radeon GPU over Thunderbolt. Without it, the GPU is invisible to TinyGrad.

**You must:**
1. Open TinyGPU.app **before** any GPU operations
2. Connect to the **correct Thunderbolt port** (Port 2, Receptacle 2 on M1 MacBook Pro)
3. Verify connection: `system_profiler SPDisplaysDataType | grep -i AMD`

## The Patch: float16 Casting for GGML Compatibility

The core issue: TinyGrad's GGML quantization decoder returns `float32` tensors. On NVIDIA and CPU, this works fine. On AMD via the LLVM backend, certain operations fail silently or produce garbage output.

**The fix:** Force-cast all GGML dequantization outputs to `float16`.

```python
# Before (fails on AMD):
if ggml_type == 2: 
    return (q_to_uint8(blocks[:,2:], 4).bitcast(dtypes.int8) - 8) * blocks[:,:2].bitcast(dtypes.float16).cast(dtypes.float32)

# After (works on AMD):
if ggml_type == 2: 
    return ((q_to_uint8(blocks[:,2:], 4).bitcast(dtypes.int8) - 8) * blocks[:,:2].bitcast(dtypes.float16).cast(dtypes.float32)).cast(dtypes.float16)
```

This applies to GGML types Q4_0, Q4_1, Q8_0, Q4_K, Q5_K, and IQ4_NL — covering all common quantization formats.

**Why it works:** The AMD LLVM backend handles float16 natively and efficiently on RDNA3 architecture. The intermediate float32 computation causes buffer alignment issues that the float16 cast resolves.

The patch is ~20 lines changed in `tinygrad/nn/state.py`. Small change, big impact.

## Running Models

### Environment Variables
```bash
export AMD=1        # Use AMD backend
export AMD_LLVM=1   # Use LLVM compiler (required for eGPU)
```

### GPT-2 (Quick Test)
```bash
cd ~/Projects/tinygrad-fix
PYTHONPATH=. AMD=1 AMD_LLVM=1 python3 examples/gpt2.py \
    --model_size gpt2 --prompt "Hello" --count 20
# ~3.6 tokens/second
```

### LLaMA 3.1 8B (The Real Deal)
```bash
PYTHONPATH=. AMD=1 AMD_LLVM=1 python3 examples/llama3.py \
    --model /path/to/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf \
    --prompt "Explain quantum computing" --count 200
```

## Performance

Let's be honest: it's not fast. Thunderbolt bandwidth is the bottleneck.

| Model | Tokens/sec | VRAM Used | Notes |
|-------|-----------|-----------|-------|
| GPT-2 (124M) | ~3.6 | ~500MB | Good for testing |
| GPT-2 XL (1.5B) | ~1.5 | ~3GB | Usable |
| LLaMA 3.1 8B Q4 | ~0.8 | ~5GB | Slow but works! |

For comparison, the same LLaMA 3.1 8B runs at ~15 tok/s on the M1's integrated GPU via llama.cpp. So why bother?

**Because 24GB VRAM opens doors:**
- Run models that don't fit in 16GB unified memory
- Run multiple models simultaneously
- Experiment with SDXL, larger LLMs, etc.
- Prove the concept for future, faster Thunderbolt versions

## What We Also Tried (And Failed)

### NVIDIA RTX 5060 Ti via eGPU
We also attempted an NVIDIA RTX 5060 Ti (Blackwell/GB206) via the same Thunderbolt setup. **It doesn't work.** The GSP (GPU System Processor) firmware fails during Display Engine initialization:

```
FBFLCN error: UNRECOGNIZED_CLIENT -> HUBCLIENT_CE0 -> HUBCLIENT_VIP
GSP_INIT_DONE returns NV_ERR_TIMEOUT
```

The 570.x firmware doesn't support Thunderbolt 4/USB4 bus types. This is a firmware-level limitation that can't be worked around.

## How to Reproduce

1. **Hardware:** Any AMD RDNA2/RDNA3 GPU + Thunderbolt eGPU enclosure + Apple Silicon Mac
2. **Software:** TinyGPU.app (contact us for access)
3. **Clone tinygrad and apply our patch:**
```bash
git clone https://github.com/tinygrad/tinygrad.git
cd tinygrad
# Download and apply the float16 patch
curl -O https://raw.githubusercontent.com/FreeRiverHouse/tinygrad-mac-egpu-patch/main/float16-ggml-amd.patch
git apply float16-ggml-amd.patch
```
> 📦 Full patch repo: [FreeRiverHouse/tinygrad-mac-egpu-patch](https://github.com/FreeRiverHouse/tinygrad-mac-egpu-patch)
4. **Run:**
```bash
AMD=1 AMD_LLVM=1 python3 -c "from tinygrad import Device; print(Device['AMD'])"
```

If you see the AMD device, you're good. If not, check:
- Is TinyGPU.app running?
- Is the eGPU on the correct Thunderbolt port?
- Does `system_profiler SPDisplaysDataType` show AMD?

## Why This Matters

The ML community on Mac has been stuck with two options:
1. **Apple's MLX** — limited to Apple Silicon's unified memory
2. **llama.cpp** — CPU/Metal only, no external GPU support

Our setup adds a third option: **use an external AMD GPU for ML on Mac**. It's not perfect, it's not fast, but it works. And as Thunderbolt 5 (80 Gbps) rolls out, the bandwidth bottleneck will shrink.

If you're interested in the patch, the full diff is below. We'd love to see this upstreamed into TinyGrad.

## The Full Patch

```diff
--- a/tinygrad/nn/state.py
+++ b/tinygrad/nn/state.py
@@ -324,15 +324,15 @@
-    if ggml_type == 2: return (q_to_uint8(...) - 8) * blocks[:,:2]...
+    if ggml_type == 2: return ((q_to_uint8(...) - 8) * blocks[:,:2]...).cast(dtypes.float16)
     # Same pattern for types 3, 8, 12, 14, 39
     # Add .cast(dtypes.float16) to the return value
```

---

*Built by [FreeRiverHouse](https://onde.la) — where impossible things happen before breakfast.*

*Have questions? Find us on [X @Onde_FRH](https://x.com/Onde_FRH) or [GitHub](https://github.com/FreeRiverHouse/tinygrad-mac-egpu-patch).*
