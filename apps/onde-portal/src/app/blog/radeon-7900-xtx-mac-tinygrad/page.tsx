'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Breadcrumb from '@/components/ui/Breadcrumb'
import ReadingTimeBadge from '@/components/blog/ReadingTimeBadge'
import TableOfContents, { type TocItem } from '@/components/blog/TableOfContents'
import ShareButtons from '@/components/ShareButtons'
import RelatedPosts from '@/components/blog/RelatedPosts'
import BlogReactions from '@/components/ui/BlogReactions'

/* ─── Table of contents items ─── */
const tocItems: TocItem[] = [
  { id: 'problem', label: 'The Problem', emoji: '🧩' },
  { id: 'hardware', label: 'Hardware Setup', emoji: '🔧' },
  { id: 'patch', label: 'The Patch', emoji: '🩹' },
  { id: 'running', label: 'Running Models', emoji: '🚀' },
  { id: 'performance', label: 'Performance (Honest Numbers)', emoji: '📊' },
  { id: 'failures', label: 'What Failed', emoji: '💀' },
  { id: 'reproduce', label: 'How to Reproduce', emoji: '🔬' },
  { id: 'moved-on', label: 'Why We Moved On', emoji: '🪦' },
  { id: 'patch-diff', label: 'The Full Patch', emoji: '📄' },
]

/* ─── Article word count (pre-calculated for reading time) ─── */
const ARTICLE_WORD_COUNT = 1650
const READING_TIME = Math.max(1, Math.ceil(ARTICLE_WORD_COUNT / 200))

/* ─── helper: code block ─── */
function CodeBlock({ children, lang }: { children: string; lang?: string }) {
  return (
    <div className="relative group my-6 rounded-xl overflow-hidden border border-white/15">
      {lang && (
        <div className="px-4 py-1.5 bg-white/5 border-b border-white/15 text-xs text-white/60 font-mono">
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
      <span className="text-white/70 text-sm font-medium">{label}</span>
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
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/70 border border-white/15">
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

/* ─── helper: photo with caption ─── */
function BlogPhoto({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="my-8">
      <div className="rounded-xl overflow-hidden border border-white/15">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="w-full h-auto" loading="lazy" />
      </div>
      {caption && (
        <figcaption className="text-center text-white/60 text-sm mt-3 italic">{caption}</figcaption>
      )}
    </figure>
  )
}

/* ─── helper: photo grid (2 cols) ─── */
function PhotoGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════════
   ARTICLE
   ═══════════════════════════════════════════ */
export default function RadeonTinygradArticle() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-onde-dark">
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

      {/* ── Table of Contents (sticky sidebar on desktop) ── */}
      <TableOfContents items={tocItems} />

      {/* ── Breadcrumb ── */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/', emoji: '🏠' },
            { label: 'Tech', href: '/blog', emoji: '⚡' },
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
            {['GPU', 'TinyGrad', 'macOS', 'AMD', 'ML', 'eGPU', 'Experiment'].map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white leading-tight mb-4">
            We Got a Radeon RX 7900 XTX Running on macOS{' '}
            <span className="text-gradient-fire">Then Stopped Using It</span>
          </h1>

          <p className="text-xl text-white/80 font-medium mb-6 leading-relaxed">
            A technical experiment in doing what everyone said was impossible — and learning why they had a point.
          </p>

          {/* Meta line */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
            <span>February 2026</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>FreeRiverHouse</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <ReadingTimeBadge minutes={READING_TIME} />
          </div>

          {/* Share buttons — top */}
          <ShareButtons
            title="Running AMD Radeon RX 7900 XTX on macOS with TinyGrad"
            url="https://onde.la/blog/radeon-7900-xtx-mac-tinygrad"
            className="mt-6"
          />
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
          <p className="text-white/90 leading-relaxed mb-4">
            We got a{' '}
            <strong className="text-white">
              Radeon RX 7900 XTX (24GB VRAM)
            </strong>{' '}
            running ML inference on a{' '}
            <strong className="text-white">MacBook Pro M1</strong> via
            Thunderbolt eGPU, using{' '}
            <strong className="text-white">TinyGrad</strong> with a small
            patch. Everyone said it was impossible.{' '}
            <strong className="text-white/90">
              It technically works — but it&apos;s slow, impractical, and we ended up
              switching to MLX on Apple Silicon for actual production use.
            </strong>{' '}
            This post documents the experiment for anyone curious about the technical details.
          </p>
          <div className="flex flex-wrap gap-2">
            <ResultBadge ok>GPT-2 inference (~3.6 tok/s)</ResultBadge>
            <ResultBadge ok>LLaMA 3.1 8B (works, barely)</ResultBadge>
            <ResultBadge ok={false}>Slower than native Apple Silicon</ResultBadge>
            <ResultBadge ok={false}>Not practical for daily use</ResultBadge>
          </div>
        </motion.div>

        {/* ── Prose wrapper ── */}
        <div className="prose-custom space-y-6 text-white/90 leading-relaxed text-[16px] md:text-[17px]">
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

          <p>
            We&apos;re stubborn, so we tried anyway. Spoiler: they were <em>mostly</em> right — not
            about whether it&apos;s possible, but about whether it&apos;s practical.
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

          <PhotoGrid>
            <BlogPhoto
              src="/images/blog/radeon-egpu/radeon-7900xtx-corsair-psu.jpg"
              alt="AMD Radeon RX 7900 XTX with Corsair PSU in eGPU enclosure"
              caption="The Radeon RX 7900 XTX nestled next to the Corsair 750W PSU"
            />
            <BlogPhoto
              src="/images/blog/radeon-egpu/radeon-7900xtx-power-connectors.jpg"
              alt="Radeon 7900 XTX power connectors and cabling detail"
              caption="Power delivery: dual 8-pin connectors feeding the beast"
            />
          </PhotoGrid>

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

          <p className="text-white/70 text-sm italic">
            Yes, just getting the GPU recognized is already an achievement. That should tell you
            something about how &ldquo;supported&rdquo; this setup is.
          </p>

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

          <p className="text-white/70 text-sm italic">
            The patch is ~20 lines changed in{' '}
            <code className="text-white/80 font-mono">tinygrad/nn/state.py</code>. Small
            change, big impact — at least for getting it to run at all.
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
            LLaMA 3.1 8B (The &ldquo;Real&rdquo; Test)
          </h3>

          <CodeBlock lang="bash">{`PYTHONPATH=. AMD=1 AMD_LLVM=1 python3 examples/llama3.py \\
    --model /path/to/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf \\
    --prompt "Explain quantum computing" --count 200`}</CodeBlock>

          {/* PERFORMANCE */}
          <SectionHeading emoji="📊" id="performance">
            Performance (The Honest Numbers)
          </SectionHeading>

          <p>
            Here&apos;s where the dream meets reality. Thunderbolt bandwidth is a
            severe bottleneck, and TinyGrad&apos;s AMD LLVM backend on macOS is
            not optimized for this kind of setup.
          </p>

          <div className="card-3d p-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/15">
                  <th className="text-left py-2 text-white/70 font-medium">Model</th>
                  <th className="text-right py-2 text-white/70 font-medium">Tokens/sec</th>
                  <th className="text-right py-2 text-white/70 font-medium">VRAM</th>
                  <th className="text-right py-2 text-white/70 font-medium hidden sm:table-cell">Verdict</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 text-white/80">GPT-2 (124M)</td>
                  <td className="py-2.5 text-right text-onde-teal font-semibold">~3.6</td>
                  <td className="py-2.5 text-right text-white/80">~500MB</td>
                  <td className="py-2.5 text-right text-white/60 hidden sm:table-cell">Proof it works</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 text-white/80">GPT-2 XL (1.5B)</td>
                  <td className="py-2.5 text-right text-onde-teal font-semibold">~1.5</td>
                  <td className="py-2.5 text-right text-white/80">~3GB</td>
                  <td className="py-2.5 text-right text-white/60 hidden sm:table-cell">Painfully slow</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-white/80">LLaMA 3.1 8B Q4</td>
                  <td className="py-2.5 text-right text-onde-teal font-semibold">~0.8</td>
                  <td className="py-2.5 text-right text-white/80">~5GB</td>
                  <td className="py-2.5 text-right text-white/60 hidden sm:table-cell">Basically unusable</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            Now here&apos;s the uncomfortable comparison:
          </p>

          <div className="card-3d p-6 border-l-4 border-red-500/50">
            <p className="text-white/80 font-semibold mb-3">
              The same models on native Apple Silicon:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70">
              <li>
                LLaMA 3.1 8B via <strong className="text-white">llama.cpp on M1</strong>: ~15 tok/s
                — that&apos;s <strong className="text-red-400">nearly 20x faster</strong> than our eGPU setup
              </li>
              <li>
                LLaMA 3.1 8B via <strong className="text-white">MLX on M4 Pro</strong>: ~30+ tok/s
                — in a different universe entirely
              </li>
              <li>
                No special drivers, no TinyGPU.app, no correct-port-guessing, no patching source code
              </li>
            </ul>
          </div>

          <p>
            The 24GB VRAM argument sounds good on paper: &ldquo;run models that don&apos;t fit in 16GB!&rdquo;
            In practice, even a base M1 can run 8B models just fine via quantization, and Apple Silicon machines
            with 32GB+ unified memory are common now. The VRAM advantage doesn&apos;t compensate for being 20x slower.
          </p>

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

          <PhotoGrid>
            <BlogPhoto
              src="/images/blog/radeon-egpu/unboxing-5060ti-corsair-adtlink.jpg"
              alt="Unboxing: PNY RTX 5060 Ti, Corsair RM750e PSU, and ADT-Link adapter"
              caption="The NVIDIA attempt: RTX 5060 Ti + Corsair RM750e + ADT-Link USB4 adapter"
            />
            <BlogPhoto
              src="/images/blog/radeon-egpu/nvidia-5060ti-usb4-pcie-adapter.jpg"
              alt="PNY RTX 5060 Ti connected to ADT-Link T3G USB4 to PCIe x16 adapter"
              caption="The T3G adapter board: USB4 to PCIe x16 — the bridge that didn't work"
            />
          </PhotoGrid>

          <PhotoGrid>
            <BlogPhoto
              src="/images/blog/radeon-egpu/nvidia-5060ti-adtlink-front.jpg"
              alt="PNY GeForce RTX 5060 Ti front view with ADT-Link adapter"
              caption="PNY GeForce RTX 5060 Ti — fans spinning but no compute happening"
            />
            <BlogPhoto
              src="/images/blog/radeon-egpu/nvidia-5060ti-testbench-overhead.jpg"
              alt="NVIDIA RTX 5060 Ti on open test bench overhead view"
              caption="The open test bench setup — as DIY as it gets"
            />
          </PhotoGrid>

          <BlogPhoto
            src="/images/blog/radeon-egpu/gpu-comparison-research.jpg"
            alt="GPU comparison table showing options: RTX 4070 Ti Super, RTX 4080, RTX 3090, RX 7900 XTX"
            caption="Our research notes: comparing GPU options for eGPU use on Mac"
          />

          <CodeBlock lang="log">{`FBFLCN error: UNRECOGNIZED_CLIENT -> HUBCLIENT_CE0 -> HUBCLIENT_VIP
GSP_INIT_DONE returns NV_ERR_TIMEOUT`}</CodeBlock>

          <BlogPhoto
            src="/images/blog/radeon-egpu/boxes-5060ti-rm750e-closeup.jpg"
            alt="PNY RTX 5060 Ti 16GB GDDR7 and Corsair RM750e boxes"
            caption="Brand new hardware, zero compute: the RTX 5060 Ti (16GB GDDR7) and Corsair RM750e"
          />

          <p>
            The 570.x firmware doesn&apos;t support Thunderbolt 4/USB4 bus
            types. This is a firmware-level limitation that can&apos;t be worked
            around.
          </p>

          {/* HOW TO REPRODUCE */}
          <SectionHeading emoji="🔬" id="reproduce">
            How to Reproduce
          </SectionHeading>

          <p className="text-white/70 italic">
            We&apos;re documenting this for the technically curious — not because we recommend it.
            If you want to run LLMs on a Mac, just use MLX or llama.cpp. Seriously.
          </p>

          <div className="card-3d p-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-onde-teal/20 flex items-center justify-center text-onde-teal font-bold text-sm">
                1
              </span>
              <div>
                <p className="text-white font-medium">Hardware</p>
                <p className="text-white/80 text-sm">
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
                <p className="text-white/80 text-sm">
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
                <p className="text-white/80 text-sm">
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

          {/* WHY WE MOVED ON */}
          <SectionHeading emoji="🪦" id="moved-on">
            Why We Moved On
          </SectionHeading>

          <p>
            After the initial excitement of &ldquo;holy shit, it actually works,&rdquo; we had to be honest
            with ourselves. This setup is:
          </p>

          <div className="card-3d p-6 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-lg">❌</span>
              <p className="text-white/70">
                <strong className="text-white">Slow</strong> — 0.8 tok/s for LLaMA 8B vs ~15 tok/s
                on the same machine&apos;s native GPU via llama.cpp
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-lg">❌</span>
              <p className="text-white/70">
                <strong className="text-white">Fragile</strong> — wrong Thunderbolt port? Doesn&apos;t work.
                TinyGPU.app not running? Doesn&apos;t work. macOS update? Might break everything.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-lg">❌</span>
              <p className="text-white/70">
                <strong className="text-white">Expensive</strong> — a 7900 XTX + eGPU enclosure costs more
                than upgrading to a Mac with more unified memory
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-lg">❌</span>
              <p className="text-white/70">
                <strong className="text-white">Unnecessary</strong> — MLX on Apple Silicon is genuinely
                excellent now, well-supported, and getting better fast
              </p>
            </div>
          </div>

          <p>
            We switched to <strong className="text-white">MLX on an M4 Pro</strong> for all our
            production ML workloads. It&apos;s faster, simpler, and doesn&apos;t require praying
            to the Thunderbolt gods every time you plug in a cable. The eGPU now collects dust.
          </p>

          <div className="card-3d p-6 border-l-4 border-onde-teal/50">
            <p className="text-white/80 font-semibold mb-2">
              So why publish this?
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70">
              <li>
                <strong className="text-white">The technical details are real</strong> — the float16
                patch, the TinyGPU.app approach, the GGML buffer alignment issue. Someone might find this useful.
              </li>
              <li>
                <strong className="text-white">The NVIDIA failure data is valuable</strong> — if you&apos;re
                considering an RTX card via Thunderbolt, don&apos;t waste your money.
              </li>
              <li>
                <strong className="text-white">Honest experiment logs matter</strong> — too many blog posts
                only share successes. We tried something ambitious, it worked technically,
                but it wasn&apos;t worth using. That&apos;s a valid outcome.
              </li>
            </ul>
          </div>

          <p>
            If Thunderbolt 5 (80 Gbps) and better AMD drivers ever materialize on macOS,
            this approach might become practical. But we&apos;re not holding our breath.
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

        {/* ── Share buttons — bottom ── */}
        <div className="mt-16 pt-8 border-t border-white/15">
          <ShareButtons
            title="Running AMD Radeon RX 7900 XTX on macOS with TinyGrad"
            url="https://onde.la/blog/radeon-7900-xtx-mac-tinygrad"
          />
        </div>

        {/* ── Author card / footer ── */}
        <motion.div
          className="mt-10 card-3d p-6 md:p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-white/60 text-sm mb-4">
            Built by{' '}
            <Link
              href="/"
              className="text-onde-teal hover:text-onde-teal/80 transition-colors underline"
            >
              FreeRiverHouse
            </Link>{' '}
            — sometimes you learn more from the experiments that don&apos;t stick.
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

        {/* ── Reactions ── */}
        <BlogReactions slug="radeon-7900-xtx-mac-tinygrad" />

        {/* ── Related posts ── */}
        <RelatedPosts currentSlug="radeon-7900-xtx-mac-tinygrad" maxPosts={3} />

        {/* ── Back to blog ── */}
        <div className="mt-12 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/60 hover:text-onde-teal transition-colors text-sm"
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
