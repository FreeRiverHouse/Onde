# X Thread: Radeon 7900 XTX + TinyGrad on Mac
# Account: @FreeRiverHouse / @Onde_FRH
# Type: Thread (use Typefully --threadify or 4 newlines between tweets)
# Status: DRAFT - Ready to post via Typefully when API key is configured

---

## Tweet 1 (Hook)
Everyone said running an AMD Radeon RX 7900 XTX for ML inference on a Mac was "impossible."

24GB VRAM. Thunderbolt eGPU. TinyGrad. macOS.

We got it working. Here's the story 🧵

## Tweet 2 (The Problem)
The Mac ML problem:
• M1 has 16GB shared memory — not enough for serious LLMs
• Apple killed eGPU support on Apple Silicon
• NVIDIA has zero macOS drivers
• AMD + TinyGrad on Mac? "Not possible" — said Reddit, Discord, GitHub

We didn't accept that answer.

## Tweet 3 (The Setup)
Our setup:
🔧 Radeon RX 7900 XTX (24GB GDDR6)
📦 Razer Core X V2 (Thunderbolt 3)
💻 MacBook Pro M1
🔑 Secret weapon: TinyGPU.app

TinyGPU.app creates a virtual device interface that lets TinyGrad's AMD backend talk to the GPU over Thunderbolt. Without it, the GPU is invisible.

## Tweet 4 (The Fix)
The actual fix? ~20 lines of code.

TinyGrad's GGML decoder returns float32 tensors. Works fine on NVIDIA/CPU. Fails silently on AMD.

Solution: Force-cast all dequantization outputs to float16.

RDNA3 handles float16 natively. The intermediate float32 was causing buffer alignment issues.

## Tweet 5 (What Works)
What actually runs:

✅ GPT-2 — ~3.6 tok/s
✅ GPT-2 XL (1.5B params)
✅ LLaMA 3.1 8B (Q4 quantized)
✅ Translation models

Is it fast? No. Thunderbolt bandwidth is the bottleneck.

But 24GB VRAM means running models that literally don't fit in M1's 16GB unified memory.

## Tweet 6 (NVIDIA Comparison)
We also tried an NVIDIA RTX 5060 Ti via the same eGPU setup.

Result: completely broken.

The GSP firmware fails during Display Engine init. The 570.x firmware doesn't support Thunderbolt 4/USB4 bus types.

AMD on Mac via TinyGrad > NVIDIA on Mac (which is literally nothing).

## Tweet 7 (Why It Matters)
Why this matters for the Mac ML community:

Before: 2 options — Apple MLX (limited to unified memory) or llama.cpp (CPU/Metal only)

Now: external AMD GPU for ML on Mac.

Not perfect, not fast, but opens the door. And Thunderbolt 5 (80 Gbps) will shrink the bandwidth bottleneck.

## Tweet 8 (CTA)
The patch is ~20 lines in tinygrad/nn/state.py. We'd love to see it upstreamed.

Full writeup with code, benchmarks, and how-to reproduce coming on our blog.

Built at @FreeRiverHouse — where impossible things happen before breakfast ☕

#TinyGrad #AMD #MacML #eGPU #LLM

---

## Typefully Command (when API key is available):
```bash
/Users/mattia/.clawdbot/skills/typefully/scripts/typefully.sh create "Everyone said running an AMD Radeon RX 7900 XTX for ML inference on a Mac was \"impossible.\"

24GB VRAM. Thunderbolt eGPU. TinyGrad. macOS.

We got it working. Here's the story 🧵



The Mac ML problem:
• M1 has 16GB shared memory — not enough for serious LLMs
• Apple killed eGPU support on Apple Silicon
• NVIDIA has zero macOS drivers
• AMD + TinyGrad on Mac? \"Not possible\" — said Reddit, Discord, GitHub

We didn't accept that answer.



Our setup:
🔧 Radeon RX 7900 XTX (24GB GDDR6)
📦 Razer Core X V2 (Thunderbolt 3)
💻 MacBook Pro M1
🔑 Secret weapon: TinyGPU.app

TinyGPU.app creates a virtual device interface that lets TinyGrad's AMD backend talk to the GPU over Thunderbolt. Without it, the GPU is invisible.



The actual fix? ~20 lines of code.

TinyGrad's GGML decoder returns float32 tensors. Works fine on NVIDIA/CPU. Fails silently on AMD.

Solution: Force-cast all dequantization outputs to float16.

RDNA3 handles float16 natively. The intermediate float32 was causing buffer alignment issues.



What actually runs:

✅ GPT-2 — ~3.6 tok/s
✅ GPT-2 XL (1.5B params)
✅ LLaMA 3.1 8B (Q4 quantized)
✅ Translation models

Is it fast? No. Thunderbolt bandwidth is the bottleneck.

But 24GB VRAM means running models that literally don't fit in M1's 16GB unified memory.



We also tried an NVIDIA RTX 5060 Ti via the same eGPU setup.

Result: completely broken.

The GSP firmware fails during Display Engine init. The 570.x firmware doesn't support Thunderbolt 4/USB4 bus types.

AMD on Mac via TinyGrad > NVIDIA on Mac (which is literally nothing).



Why this matters for the Mac ML community:

Before: 2 options — Apple MLX (limited to unified memory) or llama.cpp (CPU/Metal only)

Now: external AMD GPU for ML on Mac.

Not perfect, not fast, but opens the door. And Thunderbolt 5 (80 Gbps) will shrink the bandwidth bottleneck.



The patch is ~20 lines in tinygrad/nn/state.py. We'd love to see it upstreamed.

Full writeup with code, benchmarks, and how-to reproduce coming on our blog.

Built at @FreeRiverHouse — where impossible things happen before breakfast ☕

#TinyGrad #AMD #MacML #eGPU #LLM" --threadify --share
```
