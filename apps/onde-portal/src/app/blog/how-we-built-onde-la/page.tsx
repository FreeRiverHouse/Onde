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
  { id: 'the-idea', label: 'The Idea', emoji: '💡' },
  { id: 'tech-stack', label: 'Tech Stack', emoji: '🏗️' },
  { id: 'games', label: '50+ Browser Games', emoji: '🎮' },
  { id: 'books', label: 'Free Illustrated Books', emoji: '📚' },
  { id: 'skin-creator', label: 'Minecraft Skin Creator', emoji: '⛏️' },
  { id: 'ai-built-this', label: 'AI Built This', emoji: '🤖' },
  { id: 'real-numbers', label: 'Real Numbers', emoji: '📊' },
  { id: 'whats-next', label: "What's Next", emoji: '🚀' },
]

/* ─── Article word count (pre-calculated for reading time) ─── */
const ARTICLE_WORD_COUNT = 2200
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

/* ─── helper: stat card ─── */
function StatCard({
  value,
  label,
  color = 'onde-teal',
}: {
  value: string
  label: string
  color?: string
}) {
  return (
    <div className="card-3d p-4 text-center">
      <div className={`text-2xl md:text-3xl font-bold text-${color} mb-1`}>{value}</div>
      <div className="text-white/70 text-xs font-medium">{label}</div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   ARTICLE
   ═══════════════════════════════════════════ */
export default function HowWeBuiltOndeLaArticle() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-onde-dark">
      {/* ── Background orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-15"
          style={{ background: 'var(--onde-teal)', left: '-15%', top: '5%' }}
          animate={{ x: [0, 50, 0], y: [0, -40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-[140px] opacity-15"
          style={{ background: 'var(--onde-purple)', right: '-10%', top: '40%' }}
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
            { label: 'Tech', href: '/blog', emoji: '⚡' },
            { label: 'How We Built onde.la', emoji: '🌊' },
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
            {['Next.js', 'Tailwind', 'Cloudflare', 'Three.js', 'AI', 'Games', 'PWA', 'i18n'].map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white leading-tight mb-4">
            How We Built{' '}
            <span className="text-gradient-neon">onde.la</span>
          </h1>

          <p className="text-xl text-white/80 font-medium mb-6 leading-relaxed">
            A free kids&apos; site with 50+ games, illustrated books, and a Minecraft skin creator —
            built in two weeks, mostly by AI agents.
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
            title="How We Built onde.la — A Free Kids' Site, Mostly by AI"
            url="https://onde.la/blog/how-we-built-onde-la"
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
            <strong className="text-white">onde.la</strong> is a free website for kids —
            no ads, no tracking, no paywalls. It has{' '}
            <strong className="text-white">50+ browser games</strong>,{' '}
            <strong className="text-white">free illustrated books</strong> with an ePub reader,
            and a <strong className="text-white">Minecraft skin creator</strong> with real-time 3D preview.
            The whole thing runs on{' '}
            <strong className="text-white">Next.js 14 + Tailwind CSS + Cloudflare Pages</strong>,
            costs essentially nothing to host, and was built in about two weeks —
            with <strong className="text-white/90">~90% of the code written by AI agents</strong>.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard value="50+" label="Browser Games" />
            <StatCard value="~2wk" label="Build Time" color="onde-purple" />
            <StatCard value="~$0" label="Hosting Cost" color="onde-coral" />
            <StatCard value="90%" label="AI-Written Code" />
          </div>
        </motion.div>

        {/* ── Prose wrapper ── */}
        <div className="prose-custom space-y-6 text-white/90 leading-relaxed text-[16px] md:text-[17px]">
          {/* THE IDEA */}
          <SectionHeading emoji="💡" id="the-idea">
            The Idea
          </SectionHeading>

          <p>
            It started with a simple observation: the internet is a terrible place for kids.
            Every &ldquo;free&rdquo; games site is drowning in ads, dark patterns, and tracking.
            Every book app wants a subscription. Every creative tool is gated behind a paywall
            or collects data that would make a GDPR lawyer weep.
          </p>

          <p>
            We wanted to build something different: a site where a kid could just{' '}
            <em>play</em>. No sign-up, no cookies banner, no &ldquo;ask your parents&rdquo; modal.
            Just open the browser and go. Games, books, creative tools — all free,
            all safe, all fast.
          </p>

          <div className="card-3d p-6 border-l-4 border-onde-teal/50">
            <p className="text-white/80 font-semibold mb-2">
              The rules we set for ourselves:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70">
              <li><strong className="text-white">Zero ads.</strong> Not even &ldquo;tasteful&rdquo; ones.</li>
              <li><strong className="text-white">Zero tracking.</strong> No Google Analytics, no cookies, no fingerprinting.</li>
              <li><strong className="text-white">Zero paywalls.</strong> Everything is free. Period.</li>
              <li><strong className="text-white">Works offline.</strong> PWA support so kids can play without Wi-Fi.</li>
              <li><strong className="text-white">Mobile-first.</strong> Because 72% of our traffic is phones and tablets.</li>
            </ul>
          </div>

          <p>
            The name &ldquo;Onde&rdquo; comes from Italian — it means &ldquo;waves.&rdquo; We liked the
            metaphor: waves of content, free as the ocean. Also, <code className="px-1.5 py-0.5 rounded bg-white/10 text-green-300 text-sm font-mono">onde.la</code> is
            a very short domain, which helps when your main audience still types with one finger.
          </p>

          {/* TECH STACK */}
          <SectionHeading emoji="🏗️" id="tech-stack">
            Tech Stack
          </SectionHeading>

          <p>
            We went with the most boring, reliable stack we could think of.
            No experimental frameworks, no bleeding-edge dependencies. Just proven tech
            that would let us ship fast and maintain cheaply.
          </p>

          <div className="card-3d p-6">
            <InfoRow label="Framework" value="Next.js 14 (App Router)" />
            <InfoRow label="Language" value="TypeScript (strict)" />
            <InfoRow label="Styling" value="Tailwind CSS" />
            <InfoRow label="Animations" value="Framer Motion" />
            <InfoRow label="3D Rendering" value="Three.js" />
            <InfoRow label="Hosting" value="Cloudflare Pages" />
            <InfoRow label="i18n" value="Italian + English" />
            <InfoRow label="PWA" value="Service Worker + offline fallback" />
          </div>

          <h3 className="text-xl font-display font-bold text-white mt-8 mb-3">
            Why Cloudflare Pages, Not Vercel?
          </h3>

          <p>
            Vercel is the default deployment target for Next.js, and it&apos;s great. But
            Cloudflare Pages gives us something Vercel doesn&apos;t at this scale:{' '}
            <strong className="text-white">truly free hosting with unlimited bandwidth</strong>.
            For a site that serves kids around the world (with zero revenue), that matters.
          </p>

          <CodeBlock lang="bash">{`# Our deploy script — that's it
npx @cloudflare/next-on-pages
npx wrangler pages deploy .vercel/output/static \\
  --project-name=onde-la --commit-dirty=true`}</CodeBlock>

          <p>
            The tradeoff: some Next.js features (like ISR and certain middleware patterns) don&apos;t
            work on Cloudflare. We use static export with client-side interactivity — which is
            actually perfect for a site that&apos;s mostly games and books. No server-side rendering
            needed when your content is static.
          </p>

          <h3 className="text-xl font-display font-bold text-white mt-8 mb-3">
            App Router &amp; i18n
          </h3>

          <p>
            The site supports Italian and English, with the language toggle available on every page.
            We use Next.js App Router with a clean folder structure:
          </p>

          <CodeBlock lang="typescript">{`// Simplified i18n approach — no heavy library needed
// Each page reads the locale from context and loads the right strings
const t = useTranslations()

// Example: game titles, book descriptions, UI labels
// All stored in simple JSON files per locale
// /messages/en.json, /messages/it.json`}</CodeBlock>

          <p>
            We deliberately avoided complex i18n libraries. For a site with two languages and
            mostly visual content (games don&apos;t need much translation), a lightweight approach
            keeps the bundle small and the code simple.
          </p>

          {/* GAMES */}
          <SectionHeading emoji="🎮" id="games">
            50+ Browser Games
          </SectionHeading>

          <p>
            The games section is the heart of onde.la. Over 50 games, all running in the browser
            with HTML5 Canvas and vanilla JavaScript. No Unity WebGL, no heavy engines — just
            lightweight games that load fast on a cheap phone.
          </p>

          <div className="card-3d p-6 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-onde-teal font-bold text-lg">🧩</span>
              <p className="text-white/70">
                <strong className="text-white">Puzzle games</strong> — memory match, sliding puzzles, word searches
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-onde-teal font-bold text-lg">🏃</span>
              <p className="text-white/70">
                <strong className="text-white">Arcade games</strong> — platformers, obstacle runners, rhythm games
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-onde-teal font-bold text-lg">🎨</span>
              <p className="text-white/70">
                <strong className="text-white">Creative games</strong> — drawing, color mixing, pattern makers
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-onde-teal font-bold text-lg">🧮</span>
              <p className="text-white/70">
                <strong className="text-white">Learning games</strong> — math challenges, geography quizzes
              </p>
            </div>
          </div>

          <p>
            Each game is a self-contained component with its own canvas and game loop. They&apos;re
            embedded as React components but the game logic is pure JavaScript — no React in the
            hot path. This means <strong className="text-white">instant loading</strong> even on slow connections.
          </p>

          <CodeBlock lang="typescript">{`// Typical game structure
// /src/app/games/[slug]/page.tsx — the Next.js page wrapper
// /src/components/games/MemoryMatch.tsx — the React shell
// Game logic runs in a useEffect with requestAnimationFrame

useEffect(() => {
  const canvas = canvasRef.current
  const ctx = canvas?.getContext('2d')
  if (!ctx) return

  const gameLoop = () => {
    update()
    render(ctx)
    requestAnimationFrame(gameLoop)
  }
  requestAnimationFrame(gameLoop)

  return () => { /* cleanup */ }
}, [])`}</CodeBlock>

          <p>
            The key insight: kids don&apos;t care about graphics fidelity. They care about{' '}
            <em>responsiveness</em>. A game that loads in 200ms and responds to touch instantly
            beats a AAA-looking game that takes 10 seconds to load. We optimized for time-to-playable,
            not visual complexity.
          </p>

          {/* BOOKS */}
          <SectionHeading emoji="📚" id="books">
            Free Illustrated Books
          </SectionHeading>

          <p>
            The books section features classic children&apos;s stories — illustrated, free, and
            readable right in the browser. We built a custom ePub reader that handles text,
            images, and basic formatting without pulling in a massive library.
          </p>

          <p>
            The books are stored as ePub files and rendered client-side. The reader supports:
          </p>

          <div className="card-3d p-6">
            <ul className="space-y-2 text-white/70">
              <li className="flex items-center gap-2">
                <span className="text-onde-teal">✓</span>
                <span>Page-by-page navigation with swipe support</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-onde-teal">✓</span>
                <span>Full-page illustrated spreads</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-onde-teal">✓</span>
                <span>Adjustable font size (important for young readers)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-onde-teal">✓</span>
                <span>Offline reading via PWA cache</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-onde-teal">✓</span>
                <span>Works on phones, tablets, and desktops</span>
              </li>
            </ul>
          </div>

          <p>
            We focused on public domain classics — stories that have been beloved for generations
            and don&apos;t require licensing. The illustrations were generated specifically for
            each book, giving them a fresh, modern feel while keeping the timeless stories intact.
          </p>

          {/* SKIN CREATOR */}
          <SectionHeading emoji="⛏️" id="skin-creator">
            Minecraft Skin Creator — The Star Feature
          </SectionHeading>

          <p>
            If you ask us what feature we&apos;re most proud of, it&apos;s the{' '}
            <Link href="/skin-creator" className="text-onde-teal hover:text-onde-teal/80 underline transition-colors">
              Minecraft skin creator
            </Link>. It lets kids design custom Minecraft skins with a real-time 3D preview,
            then download them ready to use — completely free, no account needed.
          </p>

          <p>
            Under the hood, it&apos;s <strong className="text-white">Three.js</strong> rendering
            a 3D Steve/Alex model with a 64×64 pixel texture map. Kids paint directly on
            the 2D texture, and the 3D model updates in real-time. It sounds simple, but
            getting the UV mapping, touch controls, and mobile performance right took
            genuine effort.
          </p>

          <CodeBlock lang="typescript">{`// Three.js scene setup for the skin preview
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100)

// Load the player model with proper UV mapping
// The 64x64 skin texture maps to specific body parts:
// - Head:  (0,0) to (32,16)
// - Body:  (16,16) to (40,32)
// - Arms:  (40,16) to (56,32)
// - Legs:  (0,16) to (16,32)

// Real-time texture update when user paints
const updateTexture = (x: number, y: number, color: string) => {
  skinContext.fillStyle = color
  skinContext.fillRect(x, y, 1, 1)
  skinTexture.needsUpdate = true  // Three.js re-uploads to GPU
}`}</CodeBlock>

          <p>
            The orbit controls let kids rotate the model, zoom in, and see their skin from
            every angle. On mobile, pinch-to-zoom and drag-to-rotate work naturally.
            The whole thing runs at 60fps even on a mid-range phone because the geometry is
            dead simple — it&apos;s just a few cubes.
          </p>

          <div className="card-3d p-6 border-l-4 border-onde-purple/50">
            <p className="text-white/80 font-semibold mb-2">
              Why this feature matters:
            </p>
            <p className="text-white/70">
              Every other Minecraft skin creator either requires a download, shows ads,
              or requires an account. Ours works entirely in the browser. Open the page,
              paint your skin, download the PNG. That&apos;s it. For a kid who just wants
              to look cool in Minecraft, that&apos;s exactly right.
            </p>
          </div>

          {/* AI BUILT THIS */}
          <SectionHeading emoji="🤖" id="ai-built-this">
            AI Built This
          </SectionHeading>

          <p>
            Here&apos;s the part that might raise eyebrows: roughly 90% of onde.la&apos;s code
            was written by AI agents. Not &ldquo;AI-assisted&rdquo; in the sense of
            autocomplete suggestions — we mean actual autonomous agents that planned features,
            wrote components, debugged issues, and deployed updates.
          </p>

          <div className="card-3d p-6">
            <InfoRow label="Agent 1" value="Clawdbot (Mac M1)" />
            <InfoRow label="Agent 2" value="Ondinho (Mac M4 Pro)" />
            <InfoRow label="Model" value="Claude (Anthropic)" />
            <InfoRow label="Orchestration" value="Clawdbot CLI" />
            <InfoRow label="Human Role" value="Direction, review, final decisions" />
          </div>

          <p>
            The workflow looks like this: a human (Mattia) describes what he wants in natural
            language — &ldquo;add a memory match game with ocean animals&rdquo; or
            &ldquo;fix the ePub reader&apos;s page transitions on mobile.&rdquo; The agents
            take it from there: they read the codebase, plan the changes, write the code,
            test it, and commit.
          </p>

          <p>
            Two agents work in parallel on the same Git repo, using a shared task system
            with locks to avoid conflicts:
          </p>

          <CodeBlock lang="markdown">{`# TASKS.md — shared between agents
| ID       | Task                          | Status      | Owner    |
|----------|-------------------------------|-------------|----------|
| GAME-042 | Add ocean memory match game   | IN_PROGRESS | Clawdbot |
| SKIN-007 | Fix mobile pinch zoom         | TODO        |          |
| BLOG-010 | Write "How We Built" post     | IN_PROGRESS | Clawdbot |
| BOOK-003 | Add "Little Prince" ePub      | DONE        | Ondinho  |`}</CodeBlock>

          <p>
            The agents pull before working, lock tasks, commit when done, and push.
            It&apos;s the same workflow a team of human developers would use — just faster
            and without coffee breaks.
          </p>

          <div className="card-3d p-6 border-l-4 border-onde-gold/50">
            <p className="text-white/80 font-semibold mb-2">
              Honest take on AI-written code:
            </p>
            <p className="text-white/70">
              It&apos;s not magic. The AI writes good first drafts — usually 80% correct — and
              then iterates. The human reviews, provides direction, and catches the things AI
              misses: taste decisions, UX nuances, &ldquo;this feels wrong even though it works.&rdquo;
              The speed gain is real (2 weeks instead of 2 months), but human judgment is still
              the secret ingredient.
            </p>
          </div>

          {/* REAL NUMBERS */}
          <SectionHeading emoji="📊" id="real-numbers">
            Real Numbers
          </SectionHeading>

          <p>
            We believe in sharing real numbers, not vanity metrics. Here&apos;s where onde.la
            actually stands:
          </p>

          <div className="card-3d p-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/15">
                  <th className="text-left py-2 text-white/70 font-medium">Metric</th>
                  <th className="text-right py-2 text-white/70 font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 text-white/80">Monthly Pageviews</td>
                  <td className="py-2.5 text-right text-onde-teal font-semibold">~1,000</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 text-white/80">Mobile Traffic</td>
                  <td className="py-2.5 text-right text-onde-teal font-semibold">72%</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 text-white/80">Monthly Hosting Cost</td>
                  <td className="py-2.5 text-right text-onde-teal font-semibold">~$0</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 text-white/80">Total Games</td>
                  <td className="py-2.5 text-right text-onde-teal font-semibold">50+</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 text-white/80">Time to Build</td>
                  <td className="py-2.5 text-right text-onde-teal font-semibold">~2 weeks</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 text-white/80">Languages</td>
                  <td className="py-2.5 text-right text-onde-teal font-semibold">2 (EN + IT)</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-white/80">Lighthouse Score</td>
                  <td className="py-2.5 text-right text-onde-teal font-semibold">90+ across the board</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            ~1,000 pageviews/month is modest. We&apos;re not going viral. But for a site with
            zero marketing budget, zero ads, and zero SEO tricks, it&apos;s organic growth
            that we&apos;re proud of. Every visit is a kid who found something fun to do
            for free.
          </p>

          <h3 className="text-xl font-display font-bold text-white mt-8 mb-3">
            What Works Best
          </h3>

          <p>
            The <strong className="text-white">Minecraft skin creator</strong> drives the most
            engagement by far — longest session time, most return visits. Games are the entry
            point that gets kids to the site, but the skin creator is what makes them come back.
          </p>

          <p>
            The <strong className="text-white">72% mobile stat</strong> confirmed our mobile-first
            approach. Kids browse on phones and tablets. If your site doesn&apos;t work perfectly
            on a 5-inch screen with touch input, you&apos;ve lost most of your audience before
            they even see your content.
          </p>

          <h3 className="text-xl font-display font-bold text-white mt-8 mb-3">
            What It Costs
          </h3>

          <div className="card-3d p-6 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-green-400 text-lg">$0</span>
              <p className="text-white/70">
                <strong className="text-white">Cloudflare Pages hosting</strong> — free tier handles our traffic easily
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 text-lg">$10/yr</span>
              <p className="text-white/70">
                <strong className="text-white">onde.la domain</strong> — a .la TLD from a registrar
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 text-lg">$0</span>
              <p className="text-white/70">
                <strong className="text-white">CDN, DDoS protection, SSL</strong> — all included in Cloudflare free tier
              </p>
            </div>
          </div>

          <p>
            Total running cost: <strong className="text-white">about $10/year</strong>. That&apos;s
            less than a single month of most &ldquo;kids&apos; content&rdquo; subscriptions.
            The AI development tools (Claude API) cost more than the hosting, which says something
            interesting about where the real costs are in modern web development.
          </p>

          {/* WHAT'S NEXT */}
          <SectionHeading emoji="🚀" id="whats-next">
            What&apos;s Next
          </SectionHeading>

          <p>
            onde.la is a living project. The AI agents keep adding features, fixing bugs,
            and improving performance. Here&apos;s what&apos;s on the roadmap:
          </p>

          <div className="card-3d p-6 space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-onde-teal/20 flex items-center justify-center text-onde-teal font-bold text-sm">
                1
              </span>
              <div>
                <p className="text-white font-medium">More games</p>
                <p className="text-white/80 text-sm">
                  Targeting 100+ games across more categories — science, music, coding basics
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-onde-teal/20 flex items-center justify-center text-onde-teal font-bold text-sm">
                2
              </span>
              <div>
                <p className="text-white font-medium">More languages</p>
                <p className="text-white/80 text-sm">
                  Spanish, Portuguese, and French are the next priorities
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-onde-teal/20 flex items-center justify-center text-onde-teal font-bold text-sm">
                3
              </span>
              <div>
                <p className="text-white font-medium">Skin creator upgrades</p>
                <p className="text-white/80 text-sm">
                  Template skins, undo/redo, layer support, community gallery
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-onde-teal/20 flex items-center justify-center text-onde-teal font-bold text-sm">
                4
              </span>
              <div>
                <p className="text-white font-medium">More books</p>
                <p className="text-white/80 text-sm">
                  Expanding the library with more illustrated classics and original stories
                </p>
              </div>
            </div>
          </div>

          <p>
            The beautiful thing about building with AI agents is that adding a new game or
            book isn&apos;t a multi-day project anymore. Describe what you want, let the
            agents build it, review the result. The bottleneck isn&apos;t coding — it&apos;s
            deciding what to build next.
          </p>

          <div className="card-3d p-6 border-l-4 border-onde-teal/50">
            <p className="text-white/80 leading-relaxed">
              If you want to check it out, just go to{' '}
              <a
                href="https://onde.la"
                target="_blank"
                rel="noopener noreferrer"
                className="text-onde-teal hover:text-onde-teal/80 underline transition-colors"
              >
                onde.la
              </a>
              . Play a game, read a book, make a Minecraft skin. It&apos;s free.
              If you have kids, share it with them. If you&apos;re a developer, the whole thing is{' '}
              <a
                href="https://github.com/FreeRiverHouse/Onde"
                target="_blank"
                rel="noopener noreferrer"
                className="text-onde-teal hover:text-onde-teal/80 underline transition-colors"
              >
                open on GitHub
              </a>
              .
            </p>
          </div>
        </div>

        {/* ── Share buttons — bottom ── */}
        <div className="mt-16 pt-8 border-t border-white/15">
          <ShareButtons
            title="How We Built onde.la — A Free Kids' Site, Mostly by AI"
            url="https://onde.la/blog/how-we-built-onde-la"
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
            — humans for direction, AI for execution, and zero ads for everyone.
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
        <BlogReactions slug="how-we-built-onde-la" />

        {/* ── Related posts ── */}
        <RelatedPosts currentSlug="how-we-built-onde-la" maxPosts={3} />

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
