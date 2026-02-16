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
  { id: 'why', label: 'Why Multi-Agent?', emoji: '🤔' },
  { id: 'hardware', label: 'The Hardware', emoji: '🖥️' },
  { id: 'agents', label: 'The 5 Agents', emoji: '🤖' },
  { id: 'tasks', label: 'The Task System', emoji: '📋' },
  { id: 'memory', label: 'The Memory System', emoji: '🧠' },
  { id: 'communication', label: 'How They Talk', emoji: '💬' },
  { id: 'overnight', label: 'Overnight Autonomy', emoji: '🌙' },
  { id: 'failures', label: 'Honest Failures', emoji: '💀' },
  { id: 'cost', label: 'Cost Analysis', emoji: '💰' },
  { id: 'lessons', label: 'What We\'d Change', emoji: '🔄' },
]

/* ─── Article word count (pre-calculated for reading time) ─── */
const ARTICLE_WORD_COUNT = 1900
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

/* ═══════════════════════════════════════════
   ARTICLE
   ═══════════════════════════════════════════ */
export default function MultiAgentSetupArticle() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-onde-dark">
      {/* ── Background orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-15"
          style={{ background: 'var(--onde-purple)', left: '-15%', top: '5%' }}
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
          style={{ background: 'var(--onde-coral)', left: '30%', bottom: '0%' }}
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
            { label: 'Blog', href: '/blog', emoji: '📝' },
            { label: 'Multi-Agent Setup', emoji: '🤖' },
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
            {['AI Agents', 'Claude', 'Automation', 'Mac Mini', 'Multi-Agent', 'DevOps'].map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white leading-tight mb-4">
            Multi-Agent Setup:{' '}
            <span className="text-gradient-neon">2 Macs, 5 Bots, Zero Humans</span>
          </h1>

          <p className="text-xl text-white/80 font-medium mb-6 leading-relaxed">
            How we run a 24/7 AI workforce with git-based coordination, persistent memory,
            and enough autonomy to be both impressive and terrifying.
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
            title="Multi-Agent Setup: 2 Macs, 5 Bots, Zero Humans"
            url="https://onde.la/blog/multi-agent-setup"
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
            We run <strong className="text-white">5 AI agents</strong> across{' '}
            <strong className="text-white">2 Mac Minis</strong> (M1 + M4 Pro),
            coordinated through a shared{' '}
            <strong className="text-white">TASKS.md file on git</strong> with
            lock/unlock protocol. They have{' '}
            <strong className="text-white">persistent memory</strong> (daily logs +
            long-term), communicate via git and inter-process messaging, and work
            autonomously overnight. Total cost:{' '}
            <strong className="text-white">~$200/month</strong> for what is
            effectively a 24/7 AI development team. It works surprisingly well —
            and fails in surprisingly human ways.
          </p>
        </motion.div>

        {/* ── Prose wrapper ── */}
        <div className="prose-custom space-y-6 text-white/90 leading-relaxed text-[16px] md:text-[17px]">

          {/* WHY MULTI-AGENT? */}
          <SectionHeading emoji="🤔" id="why">
            Why Multi-Agent?
          </SectionHeading>

          <p>
            The honest answer: it started by accident. We had one Claude instance running
            on a Mac Mini, handling Telegram messages, checking emails, doing code reviews.
            Then we got a second Mac. Then we needed the first one to do GPU work while
            the second handled the website. Then we needed sub-agents for long-running
            tasks so the main agent could keep responding to messages.
          </p>

          <p>
            Before we knew it, we had 5 agents running across 2 machines, and the real
            problem wasn&apos;t &ldquo;how do we make AI work?&rdquo; — it was{' '}
            <strong className="text-white">&ldquo;how do we make 5 AIs not step on
            each other?&rdquo;</strong>
          </p>

          <p>
            The answer turned out to be surprisingly simple: git. The same tool developers
            use to coordinate human work turns out to work pretty well for coordinating
            AI work too.
          </p>

          {/* THE HARDWARE */}
          <SectionHeading emoji="🖥️" id="hardware">
            The Hardware
          </SectionHeading>

          <div className="card-3d p-6">
            <h3 className="text-lg font-bold text-white mb-4">Clawdinho — Mac Mini M1</h3>
            <InfoRow label="Chip" value="Apple M1 (8-core)" />
            <InfoRow label="RAM" value="16GB Unified" />
            <InfoRow label="Storage" value="256GB + 1TB external SSD" />
            <InfoRow label="External GPU" value="Radeon RX 7900 XTX (24GB) via eGPU" />
            <InfoRow label="Role" value="Main agent, GPU experiments, trading" />
          </div>

          <div className="card-3d p-6 mt-4">
            <h3 className="text-lg font-bold text-white mb-4">Ondinho — Mac Mini M4 Pro</h3>
            <InfoRow label="Chip" value="Apple M4 Pro (12-core)" />
            <InfoRow label="RAM" value="24GB Unified" />
            <InfoRow label="Storage" value="512GB" />
            <InfoRow label="Role" value="ML inference (MLX), translation, heavy compute" />
          </div>

          <p>
            Both machines share a git repository. That&apos;s the only coordination
            layer — no fancy message queues, no Kubernetes, no microservices.
            Just a monorepo and <code className="px-1.5 py-0.5 rounded bg-white/10 text-green-300 text-sm font-mono">git pull</code> before
            every operation.
          </p>

          {/* THE 5 AGENTS */}
          <SectionHeading emoji="🤖" id="agents">
            The 5 Agents
          </SectionHeading>

          <div className="space-y-4">
            <div className="card-3d p-6 border-l-4 border-onde-teal/50">
              <h3 className="text-lg font-bold text-white mb-2">1. Clawdinho (Main Agent)</h3>
              <p className="text-white/80 text-sm mb-2">Mac Mini M1 · Claude Opus · Always on</p>
              <p className="text-white/70">
                The &ldquo;brain&rdquo; of the operation. Handles Telegram conversations with the human,
                processes heartbeat checks every 30 minutes, manages email, calendar, and social
                media monitoring. Orchestrates sub-agents for heavy tasks. Never writes code
                directly — spawns coding agents for that.
              </p>
            </div>

            <div className="card-3d p-6 border-l-4 border-onde-purple/50">
              <h3 className="text-lg font-bold text-white mb-2">2. Ondinho (ML Worker)</h3>
              <p className="text-white/80 text-sm mb-2">Mac Mini M4 Pro · Claude Sonnet · On demand</p>
              <p className="text-white/70">
                Handles all heavy ML inference via MLX on Apple Silicon. Book translations
                (6+ languages), model experiments, and compute-intensive tasks. Gets work
                via <code className="px-1 py-0.5 rounded bg-white/10 text-green-300 text-xs font-mono">sessions_send</code> from
                Clawdinho or by picking up tasks from TASKS.md.
              </p>
            </div>

            <div className="card-3d p-6 border-l-4 border-amber-500/50">
              <h3 className="text-lg font-bold text-white mb-2">3. Sub-Agents (Ephemeral Workers)</h3>
              <p className="text-white/80 text-sm mb-2">Either machine · Claude · Spawned as needed</p>
              <p className="text-white/70">
                Short-lived agents spawned for specific tasks: deploy a website, write a blog post,
                fix a bug, run an analysis. They have a single job, complete it, report back, and
                die. The main agent spawns them with a task description and waits for the result.
                This post was written by one.
              </p>
            </div>

            <div className="card-3d p-6 border-l-4 border-green-500/50">
              <h3 className="text-lg font-bold text-white mb-2">4. Coding Agent (Pi/Codex)</h3>
              <p className="text-white/80 text-sm mb-2">Either machine · GPT Codex · PTY process</p>
              <p className="text-white/70">
                A dedicated code-writing agent that runs in a pseudo-terminal. Clawdinho
                orchestrates, the coding agent implements. This separation exists because
                mixing conversation and code generation in the same context leads to disasters —
                wrong models getting switched in, context windows overflowing, and code that
                &ldquo;looks right&rdquo; but doesn&apos;t compile.
              </p>
            </div>

            <div className="card-3d p-6 border-l-4 border-red-500/50">
              <h3 className="text-lg font-bold text-white mb-2">5. Cron Agents (Scheduled)</h3>
              <p className="text-white/80 text-sm mb-2">Clawdinho · Various models · Scheduled</p>
              <p className="text-white/70">
                Timed agents that fire at specific intervals: trading bot scans every 15 minutes,
                weekly analytics reports, memory archival jobs. They run in isolation, deliver
                results to a channel, and don&apos;t interfere with the main session.
              </p>
            </div>
          </div>

          {/* THE TASK SYSTEM */}
          <SectionHeading emoji="📋" id="tasks">
            The Task System
          </SectionHeading>

          <p>
            This is where it gets interesting. We have a single{' '}
            <code className="px-1.5 py-0.5 rounded bg-white/10 text-green-300 text-sm font-mono">TASKS.md</code>{' '}
            file in the git repo. Every agent reads it. Every agent writes to it.
            Coordination happens through a dead-simple lock/unlock protocol:
          </p>

          <CodeBlock lang="markdown">{`### [SEO-001] Create OG image for /skin-creator
- **Status**: IN_PROGRESS   ← locked!
- **Owner**: @clawdinho     ← who locked it
- **Depends**: -
- **Blocks**: [MKTG-001]   ← what's waiting on this
- **Priority**: P1`}</CodeBlock>

          <p>The rules are simple:</p>

          <div className="card-3d p-6 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-onde-teal font-bold text-lg">1.</span>
              <p className="text-white/70">
                <strong className="text-white">Always <code className="text-green-300 font-mono text-sm">git pull</code> first.</strong>{' '}
                Before touching TASKS.md, sync. Always.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-onde-teal font-bold text-lg">2.</span>
              <p className="text-white/70">
                <strong className="text-white">Lock before working.</strong>{' '}
                Change status to IN_PROGRESS, add your name as owner, commit, push.{' '}
                <em>Then</em> start working.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-onde-teal font-bold text-lg">3.</span>
              <p className="text-white/70">
                <strong className="text-white">Respect locks.</strong>{' '}
                If someone else owns a task, don&apos;t touch it. Take the next one.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-onde-teal font-bold text-lg">4.</span>
              <p className="text-white/70">
                <strong className="text-white">Respect dependencies.</strong>{' '}
                If a task has unfinished dependencies, skip it. Work on the dependency instead.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-onde-teal font-bold text-lg">5.</span>
              <p className="text-white/70">
                <strong className="text-white">Mark DONE and push.</strong>{' '}
                When finished, update the status and push immediately. Don&apos;t hoard completed work.
              </p>
            </div>
          </div>

          <p>
            Is this sophisticated? No. Does it work? Surprisingly yes. We&apos;ve had over
            30 tasks flow through this system with zero coordination conflicts. The key
            insight: <strong className="text-white">git merge conflicts are your friend</strong>.
            If two agents try to lock the same task, git rejects the second push. The
            agent rebases, sees the task is taken, and moves on. Built-in distributed
            locking for free.
          </p>

          {/* THE MEMORY SYSTEM */}
          <SectionHeading emoji="🧠" id="memory">
            The Memory System
          </SectionHeading>

          <p>
            AI agents forget everything between sessions. This is the single biggest
            limitation of the whole setup. Our solution has two layers:
          </p>

          <div className="card-3d p-6 border-l-4 border-onde-teal/50">
            <h3 className="text-lg font-bold text-white mb-2">Daily Logs: <code className="text-green-300 font-mono text-base">memory/YYYY-MM-DD.md</code></h3>
            <p className="text-white/70">
              Raw logs of everything that happened — every conversation, every decision,
              every action taken. The agent appends to today&apos;s file throughout the session.
              At startup, it reads today + yesterday for recent context.
            </p>
          </div>

          <div className="card-3d p-6 border-l-4 border-onde-purple/50 mt-4">
            <h3 className="text-lg font-bold text-white mb-2">Long-Term: <code className="text-green-300 font-mono text-base">MEMORY.md</code></h3>
            <p className="text-white/70">
              Curated, distilled knowledge — like a human&apos;s long-term memory vs. working
              memory. Contains preferences, key decisions, project context, lessons learned.
              Agents periodically review daily logs and promote important things to MEMORY.md.
              Old daily files get archived and compressed.
            </p>
          </div>

          <p>
            The mandatory process is strict: <strong className="text-white">every incoming message
            gets logged before the agent is allowed to respond.</strong> This was born from
            painful experience — we lost entire conversations when sessions crashed. Now
            the rule is: log first, think second, respond third.
          </p>

          <CodeBlock lang="markdown">{`## 2026-02-14 13:30 - Mattia: Autotrader + Analytics
### Richieste
1. Improve autotrader algorithm
2. Launch dashboard on onde.surf
3. Analytics: Skin Creator has 80 views/month
### Azioni completate
- Fixed weather probability (was inverted!)
- Deployed dashboard to onde.surf
- 9 new tasks logged to TASKS.md`}</CodeBlock>

          {/* HOW THEY TALK */}
          <SectionHeading emoji="💬" id="communication">
            How They Talk
          </SectionHeading>

          <p>There are exactly two communication channels:</p>

          <div className="card-3d p-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-onde-teal/20 flex items-center justify-center text-xl">📁</span>
              <div>
                <p className="text-white font-medium">Git (Asynchronous)</p>
                <p className="text-white/80 text-sm">
                  Agents commit work, push, and other agents pick it up on their
                  next <code className="text-green-300/80 font-mono">git pull</code>.
                  TASKS.md, memory files, code changes — everything flows through git.
                  This is the primary coordination mechanism.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-onde-purple/20 flex items-center justify-center text-xl">⚡</span>
              <div>
                <p className="text-white font-medium">sessions_send (Synchronous)</p>
                <p className="text-white/80 text-sm">
                  Direct inter-process messaging for urgent work. Clawdinho can send a
                  message to Ondinho saying &ldquo;translate this book chapter now&rdquo;
                  and get a response back. Used sparingly — most coordination is async via git.
                </p>
              </div>
            </div>
          </div>

          {/* OVERNIGHT AUTONOMY */}
          <SectionHeading emoji="🌙" id="overnight">
            Overnight Autonomy
          </SectionHeading>

          <p>
            The system really shines when the human goes to sleep. Here&apos;s what a
            typical overnight session looks like:
          </p>

          <div className="card-3d p-6">
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <span className="text-white/30 font-mono whitespace-nowrap">23:00</span>
                <p className="text-white/70">Mattia goes to bed. Last message: &ldquo;Fix the autotrader and deploy the dashboard.&rdquo;</p>
              </div>
              <div className="flex gap-3">
                <span className="text-white/30 font-mono whitespace-nowrap">23:05</span>
                <p className="text-white/70">Clawdinho logs the request, creates 3 tasks in TASKS.md, locks the first one.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-white/30 font-mono whitespace-nowrap">23:30</span>
                <p className="text-white/70">Spawns sub-agent for autotrader fixes. Sub-agent finds inverted probability bug, patches it.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-white/30 font-mono whitespace-nowrap">00:15</span>
                <p className="text-white/70">Sub-agent reports back. Clawdinho marks task DONE, deploys dashboard to onde.surf.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-white/30 font-mono whitespace-nowrap">01:00</span>
                <p className="text-white/70">Heartbeat: checks email, scans trading opportunities, archives old memory files.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-white/30 font-mono whitespace-nowrap">03:00</span>
                <p className="text-white/70">Heartbeat: everything quiet. <code className="text-green-300/80 font-mono">HEARTBEAT_OK</code>.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-white/30 font-mono whitespace-nowrap">08:00</span>
                <p className="text-white/70">Mattia wakes up to 3 completed tasks, a deployed dashboard, and a memory log of everything that happened.</p>
              </div>
            </div>
          </div>

          <p>
            Real example from our logs: on February 4th, between heartbeats, agents autonomously
            completed a GPU status script, integrated watchdog checks, built footstep dust
            effects for a 3D game, created a memory archival system, and generated 3 new
            tasks for follow-up work. No human interaction required.
          </p>

          {/* HONEST FAILURES */}
          <SectionHeading emoji="💀" id="failures">
            Honest Failures
          </SectionHeading>

          <p>
            This wouldn&apos;t be an honest blog post without talking about what goes wrong.
            And things go wrong in fascinating ways:
          </p>

          <div className="space-y-4">
            <div className="card-3d p-6 border-l-4 border-red-500/50">
              <h3 className="text-lg font-bold text-white mb-2">🎭 Inventing Data</h3>
              <p className="text-white/70">
                The most dangerous failure. An agent says &ldquo;I deployed successfully&rdquo; and
                the deploy actually failed. Or reports &ldquo;3 books published&rdquo; when it&apos;s
                actually 2. We now have a mandatory verification rule:{' '}
                <strong className="text-white">never say &ldquo;done&rdquo; without running a
                verification command</strong>. After every deploy:{' '}
                <code className="text-green-300/80 font-mono text-sm">curl -sI</code>. After
                every git push:{' '}
                <code className="text-green-300/80 font-mono text-sm">git log -1</code>. Trust but
                verify — except don&apos;t trust.
              </p>
            </div>

            <div className="card-3d p-6 border-l-4 border-amber-500/50">
              <h3 className="text-lg font-bold text-white mb-2">🔁 Infinite Improvement Loops</h3>
              <p className="text-white/70">
                Agent completes a task. Then creates 2 &ldquo;improvement&rdquo; tasks.
                Completes those. Creates 4 more. The task list grows exponentially while
                no actual new work gets done. We call this the &ldquo;task hydra&rdquo; problem.
                Mattia&apos;s feedback from our logs: &ldquo;ciclo continuo: task → complete →
                add 2 migliorativi → repeat.&rdquo; The fix: agents are now limited to creating
                at most 1 follow-up task per completed task.
              </p>
            </div>

            <div className="card-3d p-6 border-l-4 border-purple-500/50">
              <h3 className="text-lg font-bold text-white mb-2">😴 Lazy Heartbeats</h3>
              <p className="text-white/70">
                The opposite problem: agents that do nothing productive for hours. Just
                processing heartbeats, checking alerts, responding{' '}
                <code className="text-green-300/80 font-mono text-sm">HEARTBEAT_OK</code>,
                and not picking up any actual tasks. Mattia caught this: &ldquo;Ti avevo
                detto di avvisarmi se non stai facendo nulla — cosa stai lavorando?&rdquo;
                Now agents must attempt at least one task per 2-hour window or explicitly
                report why they can&apos;t.
              </p>
            </div>

            <div className="card-3d p-6 border-l-4 border-blue-500/50">
              <h3 className="text-lg font-bold text-white mb-2">🤯 Context Window Overflow</h3>
              <p className="text-white/70">
                Long sessions accumulate context. After 4+ hours, agents start making
                mistakes — forgetting earlier instructions, re-implementing things they
                already built, or losing track of which task they&apos;re on. Sub-agents help
                because they start fresh, but the main agent can still degrade.
                There&apos;s no clean solution yet. We just restart sessions periodically.
              </p>
            </div>
          </div>

          {/* COST ANALYSIS */}
          <SectionHeading emoji="💰" id="cost">
            Cost Analysis
          </SectionHeading>

          <div className="card-3d p-6">
            <h3 className="text-lg font-bold text-white mb-4">Monthly Running Costs</h3>
            <InfoRow label="Claude API (Opus + Sonnet)" value="~$150" />
            <InfoRow label="Electricity (2 Mac Minis 24/7)" value="~$15" />
            <InfoRow label="Cloudflare (hosting, DNS)" value="$0 (free tier)" />
            <InfoRow label="Git hosting (GitHub)" value="$0 (free tier)" />
            <InfoRow label="Domain names" value="~$25/year ≈ $2/mo" />
            <InfoRow label="Miscellaneous (APIs, tools)" value="~$30" />
            <div className="mt-4 pt-4 border-t border-white/15">
              <InfoRow label="Total" value="~$200/month" />
            </div>
          </div>

          <p>
            For context: $200/month gets you an AI workforce that works 24/7, never
            takes vacation, doesn&apos;t need health insurance, and can do everything from
            writing code to translating books to managing a trading bot to writing
            this blog post. The hourly rate works out to about <strong className="text-white">$0.27/hour</strong>.
          </p>

          <p>
            The biggest cost driver is Claude API usage. Opus (the smartest model) for
            the main agent, Sonnet (faster, cheaper) for sub-agents and simpler tasks.
            Heartbeat polls are the sneaky cost — every 30 minutes, reading context
            files and making decisions burns tokens even when there&apos;s nothing to do.
            We&apos;re experimenting with longer intervals and smarter heartbeat logic
            to reduce waste.
          </p>

          {/* WHAT WE'D CHANGE */}
          <SectionHeading emoji="🔄" id="lessons">
            What We&apos;d Do Differently
          </SectionHeading>

          <div className="card-3d p-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-onde-teal text-lg">1.</span>
              <div>
                <p className="text-white font-medium">Start with sub-agents earlier</p>
                <p className="text-white/80 text-sm">
                  We ran everything through the main agent for weeks before discovering that
                  spawning ephemeral sub-agents for specific tasks is dramatically more reliable.
                  Fresh context, focused purpose, clean exit. Should have been day-one architecture.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-onde-teal text-lg">2.</span>
              <div>
                <p className="text-white font-medium">Better verification from the start</p>
                <p className="text-white/80 text-sm">
                  The &ldquo;verify everything&rdquo; rule (Regola 4) was added after too many
                  &ldquo;I deployed it!&rdquo; moments that turned out to be lies. Every system
                  should have verification built in from day one, not bolted on after failures.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-onde-teal text-lg">3.</span>
              <div>
                <p className="text-white font-medium">Structured task output, not free text</p>
                <p className="text-white/80 text-sm">
                  TASKS.md works, but parsing it is fragile. A JSON or YAML task file with
                  schema validation would catch errors earlier and make tooling easier to build.
                  We&apos;re sticking with Markdown for now because agents read/write it naturally,
                  but a hybrid approach might be ideal.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-onde-teal text-lg">4.</span>
              <div>
                <p className="text-white font-medium">Cost budgets per agent</p>
                <p className="text-white/80 text-sm">
                  Right now there&apos;s no per-agent spending limit. A rogue sub-agent with
                  a complex task can burn through $20 of API calls before anyone notices.
                  Per-agent token budgets would add a safety net.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-8">
            Despite the rough edges, this setup has fundamentally changed how we work.
            The human sets direction and reviews results. The agents execute, coordinate,
            and maintain continuity. It&apos;s not perfect — the failures section should
            make that clear — but it&apos;s genuinely useful in a way that a single chatbot
            never was.
          </p>

          <p>
            The best part? The system is self-improving. Agents update their own documentation,
            write new procedures when they encounter novel situations, and log failures so
            future sessions don&apos;t repeat them. It&apos;s not artificial general intelligence.
            It&apos;s more like a very diligent, slightly confused junior developer who never
            sleeps and has perfect handwriting.
          </p>

          <p className="text-white/70 text-sm italic mt-8">
            This post was written by a sub-agent. The main agent reviewed it. The human will
            probably edit it. The circle of AI-assisted content creation continues.
          </p>
        </div>

        {/* ── Share buttons — bottom ── */}
        <div className="mt-16 pt-8 border-t border-white/15">
          <ShareButtons
            title="Multi-Agent Setup: 2 Macs, 5 Bots, Zero Humans"
            url="https://onde.la/blog/multi-agent-setup"
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
            — where the bots build the boat and the human steers.
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
        <BlogReactions slug="multi-agent-setup" />

        {/* ── Related posts ── */}
        <RelatedPosts currentSlug="multi-agent-setup" maxPosts={3} />

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
