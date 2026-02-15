'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Breadcrumb from '@/components/ui/Breadcrumb'

/* ─── helper: code block ─── */
function CodeBlock({ children, lang }: { children: string; lang?: string }) {
  return (
    <div className="relative group my-6 rounded-xl overflow-hidden border border-white/10">
      {lang && (
        <div className="px-4 py-1.5 bg-white/5 border-b border-white/10 text-xs text-white/40 font-mono">
          {lang}
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed bg-onde-dark-surface/80 backdrop-blur-sm">
        <code className="text-green-300/90 font-mono">{children}</code>
      </pre>
    </div>
  )
}

/* ─── helper: info table row ─── */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-white/5 last:border-0">
      <span className="text-white/50 text-sm font-medium">{label}</span>
      <span className="text-white/90 text-sm font-semibold text-right">{value}</span>
    </div>
  )
}

/* ─── helper: section heading ─── */
function SectionHeading({
  emoji,
  children,
  id,
}: {
  emoji: string
  children: React.ReactNode
  id?: string
}) {
  return (
    <motion.h2
      id={id}
      className="text-2xl md:text-3xl font-display font-bold text-white mt-16 mb-6 flex items-center gap-3"
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
    >
      <span className="text-2xl">{emoji}</span>
      {children}
    </motion.h2>
  )
}

/* ─── helper: tag pill ─── */
function Tag({ children }: { children: string }) {
  return (
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/50 border border-white/10">
      {children}
    </span>
  )
}

/* ─── helper: result badge ─── */
function ResultBadge({
  ok,
  children,
}: {
  ok: boolean
  children: React.ReactNode
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium ${
        ok
          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
          : 'bg-red-500/10 text-red-400 border border-red-500/20'
      }`}
    >
      {ok ? '✅' : '❌'} {children}
    </span>
  )
}

/* ═══════════════════════════════════════════
   ARTICLE
   ═══════════════════════════════════════════ */
export default function RadeonTinygradArticle() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ── Background orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-15"
          style={{ background: 'var(--onde-coral)', left: '-15%', top: '5%' }}
          animate={{ x: [0, 50, 0], y: [0, -40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-[140px] opacity-15"
          style={{ background: 'var(--onde-teal)', right: '-10%', top: '40%' }}
          animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full blur-[140px] opacity-10"
          style={{ background: 'var(--onde-purple)', left: '30%', bottom: '0%' }}
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ── Breadcrumb ── */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/', emoji: '🏠' },
            { label: 'Blog', href: '/blog', emoji: '📝' },
            { label: 'Radeon 7900 XTX + TinyGrad', emoji: '🔥' },
          ]}
        />
      </div>

      {/* ════════════════ HERO ════════════════ */}
      <header className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['GPU', 'TinyGrad', 'macOS', 'AMD', 'ML', 'eGPU'].map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white leading-tight mb-4">
            Running AMD Radeon RX 7900 XTX on macOS{' '}
            <span className="text-gradient-fire">with TinyGrad</span>
          </h1>

          <p className="text-xl text-onde-teal font-medium mb-6">
            The &ldquo;Impossible&rdquo; Setup
          </p>

          {/* Meta line */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/40">
            <span>February 2026</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>FreeRiverHouse</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>8 min read</span>
          </div>
        </motion.div>
      </header>

      {/* ════════════════ ARTICLE BODY ════════════════ */}
      <article className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* ── TL;DR Card ── */}
        <motion.div
          className="card-3d p-6 md:p-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-bold text-onde-teal mb-4 flex items-center gap-2">
            <span className="text-xl">⚡</span> TL;DR
          </h2>
          <p className="text-white/70 leading-relaxed mb-4">
            We got a{' '}
            <strong className="text-white">
              Radeon RX 7900 XTX (24GB VRAM)
            </strong>{' '}
            running ML inference on a{' '}
            <strong className="text-white">MacBook Pro M1</strong> via
            Thunderbolt eGPU, using{' '}
            <strong className="text-white">TinyGrad</strong> with a small
            patch. Everyone said it was impossible. Here&apos;s how we did it.
          </p>
          <div className="flex flex-wrap gap-2">
            <ResultBadge ok>GPT-2 inference (~3.6 tok/s)</ResultBadge>
            <ResultBadge ok>GPT-2 XL (1.5B params)</ResultBadge>
            <ResultBadge ok>LLaMA 3.1 8B (Q4_K_M)</ResultBadge>
            <ResultBadge ok>Translation models</ResultBadge>
          </div>
        </motion.div>

        {/* ── Prose wrapper ── */}
        <div className="prose-custom space-y-6 text-white/70 leading-relaxed text-[16px] md:text-[17px]">
          {/* THE PROBLEM */}
          <SectionHeading emoji="🧩" id="problem">
            The Problem
          </SectionHeading>

          <p>
            Apple Silicon Macs are great, but if you want to run larger ML
            models, you&apos;re limited to the unified memory of your Mac. An M1
            has 16GB shared between CPU and GPU — not enough for serious LLM
            work.
          </p>

          <p>
            External GPUs (eGPUs) seem like the obvious solution: plug in a
            powerful desktop GPU via Thunderbolt and get 24GB of dedicated VRAM.
            But:
          </p>

          <div className="card-3d p-6 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-red-400 font-bold text-lg">1.</span>
              <p className="text-white/70">
                <strong className="text-white">Apple dropped eGPU support</strong> in macOS
                Ventura for Apple Silicon
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-400 font-bold text-lg">2.</span>
              <p className="text-white/70">
                <strong className="text-white">NVIDIA doesn&apos;t work on macOS</strong> at
                all (no drivers since Mojave)
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-400 font-bold text-lg">3.</span>
              <p className="text-white/70">
                <strong className="text-white">AMD Radeon + TinyGrad</strong> on macOS?
                &ldquo;Not possible&rdquo; — said everyone on Discord, Reddit,
                and GitHub Issues
              </p>
            </div>
          </div>

          <p className="text-onde-teal font-semibold text-lg">
            We proved them wrong.
          </p>

          {/* HARDWARE SETUP */}
          <SectionHeading emoji="🔧" id="hardware">
            Hardware Setup
          </SectionHeading>

          <div className="card-3d p-6">
            <InfoRow label="GPU" value="AMD Radeon RX 7900 XTX (24GB GDDR6)" />
            <InfoRow label="Enclosure" value="Razer Core X V2 (Thunderbolt 3)" />
            <InfoRow label="Host" value="MacBook Pro M1 (2021)" />
            <InfoRow label="Connection" value="Thunderbolt 3/4" />
            <InfoRow label="Key Software" value="TinyGPU.app" />
          </div>

          <h3 className="text-xl font-display font-bold text-white mt-8 mb-3">
            Critical Detail: TinyGPU.app
          </h3>

          <p>
            The magic ingredient is <strong className="text-white">TinyGPU.app</strong> — a
            macOS app that creates a virtual device interface, allowing
            TinyGrad&apos;s AMD backend to communicate with the Radeon GPU over
            Thunderbolt. Without it, the GPU is invisible to TinyGrad.
          </p>

          <div className="card-3d p-6 border-l-4 border-onde-gold/50">
            <p className="text-white/80">
              <strong className="text-onde-gold">You must:</strong>
            </p>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-white/70">
              <li>Open TinyGPU.app <strong className="text-white">before</strong> any GPU operations</li>
              <li>Connect to the <strong className="text-white">correct Thunderbolt port</strong> (Port 2, Receptacle 2 on M1)</li>
              <li>Verify connection with the system profiler command below</li>
            </ol>
          </div>

          <CodeBlock lang="bash">{`system_profiler SPDisplaysDataType | grep -i AMD`}</CodeBlock>

          {/* THE PATCH */}
          <SectionHeading emoji="🩹" id="patch">
            The Patch: float16 Casting for GGML
          </SectionHeading>

          <p>
            The core issue: TinyGrad&apos;s GGML quantization decoder returns{' '}
            <code className="px-1.5 py-0.5 rounded bg-white/10 text-green-300 text-sm font-mono">
              float32
            </code>{' '}
            tensors. On NVIDIA and CPU, this works fine. On AMD via the LLVM
            backend, certain operations fail silently or produce garbage output.
          </p>

          <p>
            <strong className="text-white">The fix:</strong> Force-cast all GGML
            dequantization outputs to{' '}
            <code className="px-1.5 py-0.5 rounded bg-white/10 text-green-300 text-sm font-mono">
              float16
            </code>
            .
          </p>

          <CodeBlock lang="python">{`# Before (fails on AMD):
if ggml_type == 2: 
    return (q_to_uint8(blocks[:,2:], 4).bitcast(dtypes.int8) - 8) \\
        * blocks[:,:2].bitcast(dtypes.float16).cast(dtypes.float32)

# After (works on AMD):
if ggml_type == 2: 
    return ((q_to_uint8(blocks[:,2:], 4).bitcast(dtypes.int8) - 8) \\
        * blocks[:,:2].bitcast(dtypes.float16).cast(dtypes.float32)) \\
        .cast(dtypes.float16)`}</CodeBlock>

          <p>
            This applies to GGML types Q4_0, Q4_1, Q8_0, Q4_K, Q5_K, and
            IQ4_NL — covering all common quantization formats.
          </p>

          <p>
            <strong className="text-white">Why it works:</strong> The AMD LLVM
            backend handles float16 natively and efficiently on RDNA3
            architecture. The intermediate float32 computation causes buffer
            alignment issues that the float16 cast resolves.
          </p>

          <p className="text-white/50 text-sm italic">
            The patch is ~20 lines changed in{' '}
            <code className="text-white/60 font-mono">tinygrad/nn/state.py</code>. Small
            change, big impact.
          </p>

          {/* RUNNING MODELS */}
          <SectionHeading emoji="🚀" id="running">
            Running Models
          </SectionHeading>

          <h3 className="text-xl font-display font-bold text-white mt-8 mb-3">
            Environment Variables
          </h3>

          <CodeBlock lang="bash">{`export AMD=1        # Use AMD backend
export AMD_LLVM=1   # Use LLVM compiler (required for eGPU)`}</CodeBlock>

          <h3 className="text-xl font-display font-bold text-white mt-8 mb-3">
            GPT-2 (Quick Test)
          </h3>

          <CodeBlock lang="bash">{`cd ~/Projects/tinygrad-fix
PYTHONPATH=. AMD=1 AMD_LLVM=1 python3 examples/gpt2.py \\
    --model_size gpt2 --prompt "Hello" --count 20
# ~3.6 tokens/second`}</CodeBlock>

          <h3 className="text-xl font-display font-bold text-white mt-8 mb-3">
            LLaMA 3.1 8B (The Real Deal)
          </h3>

          <CodeBlock lang="bash">{`PYTHONPATH=. AMD=1 AMD_LLVM=1 python3 examples/llama3.py \\
    --model /path/to/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf \\
    --prompt "Explain quantum computing" --count 200`}</CodeBlock>

          {/* PERFORMANCE */}
          <SectionHeading emoji="📊" id="performance">
            Performance
          </SectionHeading>

          <p>
            Let&apos;s be honest: it&apos;s not fast. Thunderbolt bandwidth is
            the bottleneck.
          </p>

          <div className="card-3d p-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 text-white/50 font-medium">Model</th>
                  <th className="text-right py-2 text-white/50 font-medium">Tokens/sec</th>
                  <th className="text-right py-2 text-white/50 font-medium">VRAM</th>
                  <th className="text-right py-2 text-white/50 font-medium hidden sm:table-cell">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 text-white/80">GPT-2 (124M)</td>
                  <td className="py-2.5 text-right text-onde-teal font-semibold">~3.6</td>
                  <td className="py-2.5 text-right text-white/60">~500MB</td>
                  <td className="py-2.5 text-right text-white/40 hidden sm:table-cell">Good for testing</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 text-white/80">GPT-2 XL (1.5B)</td>
                  <td className="py-2.5 text-right text-onde-teal font-semibold">~1.5</td>
                  <td className="py-2.5 text-right text-white/60">~3GB</td>
                  <td className="py-2.5 text-right text-white/40 hidden sm:table-cell">Usable</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-white/80">LLaMA 3.1 8B Q4</td>
                  <td className="py-2.5 text-right text-onde-teal font-semibold">~0.8</td>
                  <td className="py-2.5 text-right text-white/60">~5GB</td>
                  <td className="py-2.5 text-right text-white/40 hidden sm:table-cell">Slow but works!</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            For comparison, the same LLaMA 3.1 8B runs at ~15 tok/s on the
            M1&apos;s integrated GPU via llama.cpp. So why bother?
          </p>

          <div className="card-3d p-6 border-l-4 border-onde-teal/50">
            <p className="text-white/80 font-semibold mb-2">
              Because 24GB VRAM opens doors:
            </p>
            <ul className="list-disc list-inside space-y-1 text-white/70">
              <li>Run models that don&apos;t fit in 16GB unified memory</li>
              <li>Run multiple models simultaneously</li>
              <li>Experiment with SDXL, larger LLMs, etc.</li>
              <li>Prove the concept for future, faster Thunderbolt versions</li>
            </ul>
          </div>

          {/* WHAT FAILED */}
          <SectionHeading emoji="💀" id="failures">
            What We Also Tried (And Failed)
          </SectionHeading>

          <h3 className="text-xl font-display font-bold text-white mt-8 mb-3">
            NVIDIA RTX 5060 Ti via eGPU
          </h3>

          <p>
            We also attempted an NVIDIA RTX 5060 Ti (Blackwell/GB206) via the
            same Thunderbolt setup.{' '}
            <strong className="text-red-400">It doesn&apos;t work.</strong> The
            GSP (GPU System Processor) firmware fails during Display Engine
            initialization:
          </p>

          <CodeBlock lang="log">{`FBFLCN error: UNRECOGNIZED_CLIENT -> HUBCLIENT_CE0 -> HUBCLIENT_VIP
GSP_INIT_DONE returns NV_ERR_TIMEOUT`}</CodeBlock>

          <p>
            The 570.x firmware doesn&apos;t support Thunderbolt 4/USB4 bus
            types. This is a firmware-level limitation that can&apos;t be worked
            around.
          </p>

          {/* HOW TO REPRODUCE */}
          <SectionHeading emoji="🔬" id="reproduce">
            How to Reproduce
          </SectionHeading>

          <div className="card-3d p-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-onde-teal/20 flex items-center justify-center text-onde-teal font-bold text-sm">
                1
              </span>
              <div>
                <p className="text-white font-medium">Hardware</p>
                <p className="text-white/60 text-sm">
                  Any AMD RDNA2/RDNA3 GPU + Thunderbolt eGPU enclosure + Apple
                  Silicon Mac
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-onde-teal/20 flex items-center justify-center text-onde-teal font-bold text-sm">
                2
              </span>
              <div>
                <p className="text-white font-medium">Software</p>
                <p className="text-white/60 text-sm">
                  TinyGPU.app (contact us for access)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-onde-teal/20 flex items-center justify-center text-onde-teal font-bold text-sm">
                3
              </span>
              <div>
                <p className="text-white font-medium">Clone &amp; patch</p>
                <p className="text-white/60 text-sm">
                  Clone TinyGrad and apply the float16 patch to{' '}
                  <code className="text-green-300/80 font-mono">
                    tinygrad/nn/state.py
                  </code>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-onde-teal/20 flex items-center justify-center text-onde-teal font-bold text-sm">
                4
              </span>
              <div>
                <p className="text-white font-medium">Run</p>
              </div>
            </div>
          </div>

          <CodeBlock lang="bash">{`AMD=1 AMD_LLVM=1 python3 -c \\
  "from tinygrad import Device; print(Device['AMD'])"`}</CodeBlock>

          <p>
            If you see the AMD device, you&apos;re good. If not, check:
          </p>
          <ul className="list-disc list-inside space-y-1 text-white/70 ml-2">
            <li>Is TinyGPU.app running?</li>
            <li>Is the eGPU on the correct Thunderbolt port?</li>
            <li>
              Does{' '}
              <code className="px-1 py-0.5 rounded bg-white/10 text-green-300 text-xs font-mono">
                system_profiler SPDisplaysDataType
              </code>{' '}
              show AMD?
            </li>
          </ul>

          {/* WHY THIS MATTERS */}
          <SectionHeading emoji="🌊" id="why">
            Why This Matters
          </SectionHeading>

          <p>
            The ML community on Mac has been stuck with two options:
          </p>

          <div className="grid sm:grid-cols-2 gap-4 my-6">
            <div className="card-3d p-5 text-center">
              <p className="text-lg font-bold text-white mb-1">Apple&apos;s MLX</p>
              <p className="text-sm text-white/50">
                Limited to Apple Silicon&apos;s unified memory
              </p>
            </div>
            <div className="card-3d p-5 text-center">
              <p className="text-lg font-bold text-white mb-1">llama.cpp</p>
              <p className="text-sm text-white/50">
                CPU/Metal only, no external GPU support
              </p>
            </div>
          </div>

          <p>
            Our setup adds a third option:{' '}
            <strong className="text-onde-teal">
              use an external AMD GPU for ML on Mac
            </strong>
            . It&apos;s not perfect, it&apos;s not fast, but it works. And as
            Thunderbolt 5 (80 Gbps) rolls out, the bandwidth bottleneck will
            shrink.
          </p>

          <p>
            If you&apos;re interested in the patch, we&apos;d love to see this
            upstreamed into TinyGrad.
          </p>

          {/* THE FULL PATCH */}
          <SectionHeading emoji="📄" id="patch-diff">
            The Full Patch
          </SectionHeading>

          <CodeBlock lang="diff">{`--- a/tinygrad/nn/state.py
+++ b/tinygrad/nn/state.py
@@ -324,15 +324,15 @@
-    if ggml_type == 2: return (q_to_uint8(...) - 8) * blocks[:,:2]...
+    if ggml_type == 2: return ((q_to_uint8(...) - 8) * blocks[:,:2]...).cast(dtypes.float16)
     # Same pattern for types 3, 8, 12, 14, 39
     # Add .cast(dtypes.float16) to the return value`}</CodeBlock>
        </div>

        {/* ── Author card / footer ── */}
        <motion.div
          className="mt-16 card-3d p-6 md:p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-white/40 text-sm mb-4">
            Built by{' '}
            <Link
              href="/"
              className="text-onde-teal hover:text-onde-teal/80 transition-colors underline"
            >
              FreeRiverHouse
            </Link>{' '}
            — where impossible things happen before breakfast.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://x.com/Onde_FRH"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-glow text-sm px-4 py-2"
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                @Onde_FRH
              </span>
            </a>
            <a
              href="https://github.com/FreeRiverHouse/Onde"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-glow text-sm px-4 py-2"
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
                </svg>
                GitHub
              </span>
            </a>
          </div>
        </motion.div>

        {/* ── Back to blog ── */}
        <div className="mt-12 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/40 hover:text-onde-teal transition-colors text-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to all posts
          </Link>
        </div>
      </article>
    </div>
  )
}
