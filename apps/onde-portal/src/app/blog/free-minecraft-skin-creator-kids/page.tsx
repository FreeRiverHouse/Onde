'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Breadcrumb from '@/components/ui/Breadcrumb'
import Script from 'next/script'

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

const faqItems = [
  {
    question: 'Is this Minecraft skin creator really free for kids?',
    answer:
      'Yes, 100% free! There are no premium tiers, no in-app purchases, and no hidden costs. Kids can create, edit, and download as many skins as they want without paying anything.',
  },
  {
    question: 'Do my kids need to create an account or sign up?',
    answer:
      'No account or signup is required. Just open the skin creator in any web browser and start designing right away. We don\'t collect any personal information.',
  },
  {
    question: 'Is the skin creator safe for children to use?',
    answer:
      'Absolutely. Our editor runs entirely in the browser — no data is uploaded to any server. There are no ads, no chat features, no social components, and no external links that could lead kids to unsafe content.',
  },
  {
    question: 'What Minecraft versions do the skins work with?',
    answer:
      'Skins created with our editor work with both Minecraft Java Edition and Bedrock Edition (Windows 10, mobile, consoles). Just download the PNG file and upload it through your Minecraft profile settings.',
  },
  {
    question: 'Can my child use this on a tablet or phone?',
    answer:
      'Yes! The skin creator is fully responsive and works great on iPads, Android tablets, and smartphones. The touch-friendly interface makes it easy for kids to paint and edit on any device.',
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
}

export default function FreeMinecraftSkinCreatorKids() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* FAQ Schema.org structured data */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-[150px] opacity-15 bg-gradient-to-br from-cyan-500 to-blue-500"
          style={{ left: '-10%', top: '10%' }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-[150px] opacity-15 bg-gradient-to-br from-pink-500 to-rose-500"
          style={{ right: '-5%', top: '40%' }}
        />
      </div>

      {/* Breadcrumb */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/', emoji: '🏠' },
            { label: 'Blog', href: '/blog', emoji: '📝' },
            { label: 'Skin Creator for Kids', emoji: '🧒' },
          ]}
        />
      </div>

      {/* Article */}
      <article className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        {/* Hero */}
        <motion.header className="mb-12 text-center" {...fadeIn} transition={{ delay: 0.1 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Kid-Friendly &amp; Free
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-6">
            <span className="text-white">Free Minecraft Skin </span>
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              Creator for Kids
            </span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            A safe, ad-free online editor where kids can design their own custom Minecraft skins using AI tools,
            3D preview, and fun templates — no signup, no downloads, totally free.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-white/50">
            <span>February 2026</span>
            <span>•</span>
            <span>5 min read</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded bg-white/10">Design</span>
          </div>
        </motion.header>

        {/* CTA Button */}
        <motion.div className="text-center mb-16" {...fadeIn} transition={{ delay: 0.2 }}>
          <Link
            href="/games/skin-creator/"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-300"
          >
            🎨 Open the Skin Creator — It&apos;s Free!
          </Link>
        </motion.div>

        {/* Content */}
        <motion.div className="space-y-12" {...fadeIn} transition={{ delay: 0.3 }}>
          {/* Why kids love creating skins */}
          <section className="rounded-3xl bg-white/5 border border-white/10 p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-3xl">💜</span> Why Kids Love Creating Their Own Minecraft Skins
            </h2>
            <p className="text-white/80 leading-relaxed mb-4">
              Minecraft isn&apos;t just a game — it&apos;s a canvas for self-expression. For millions of kids around the
              world, choosing or creating a skin is one of the most exciting parts of the experience. A{' '}
              <strong className="text-white">custom Minecraft skin maker for children</strong> gives them the power to
              stand out on multiplayer servers, express their personality, and bring their imagination to life.
            </p>
            <p className="text-white/80 leading-relaxed mb-4">
              Think about it: instead of picking from the same default Steve and Alex skins everyone else uses, kids can
              design their own superhero, fantasy character, favorite animal, or something completely original. It&apos;s
              digital art meets gaming, and it teaches valuable creative skills along the way — color theory, pixel
              composition, and spatial thinking.
            </p>
            <p className="text-white/80 leading-relaxed">
              That&apos;s why we built a <strong className="text-white">free Minecraft skin creator for kids</strong>{' '}
              that&apos;s easy enough for a 6-year-old but powerful enough for teens who want fine-grained control. No
              complicated software to install, no confusing interfaces — just open your browser and start painting.
            </p>
          </section>

          {/* How AI works */}
          <section className="rounded-3xl bg-white/5 border border-white/10 p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-3xl">🤖</span> How Our AI Minecraft Skin Generator Works
            </h2>
            <p className="text-white/80 leading-relaxed mb-4">
              Our <strong className="text-white">AI Minecraft skin generator</strong> is designed to help kids who might
              not know where to start. Instead of staring at a blank canvas, they can describe what they want — &quot;a
              blue dragon knight&quot; or &quot;a space explorer with a helmet&quot; — and the AI suggests color palettes,
              patterns, and starting templates that match their idea.
            </p>
            <p className="text-white/80 leading-relaxed mb-4">
              The AI doesn&apos;t replace creativity — it amplifies it. It works as an intelligent assistant that offers
              suggestions while kids stay in full control. They can accept AI color recommendations, tweak them, or
              ignore them entirely. It&apos;s like having a helpful art teacher sitting next to them, offering ideas
              without taking over the project.
            </p>
            <p className="text-white/80 leading-relaxed">
              Everything runs directly in the browser. The AI features use lightweight models that don&apos;t send any
              data to external servers — so your child&apos;s creative ideas stay private and secure.
            </p>
          </section>

          {/* Step by step guide */}
          <section className="rounded-3xl bg-white/5 border border-white/10 p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">🚀</span> Step-by-Step: Creating a Skin in 5 Minutes
            </h2>
            <p className="text-white/70 mb-6">
              Using our <strong className="text-white">Minecraft skin editor online free</strong> is straightforward.
              Here&apos;s how kids can go from zero to a custom skin in just a few minutes:
            </p>
            <div className="space-y-6">
              {[
                {
                  step: '1',
                  title: 'Pick a Starting Point',
                  desc: 'Choose from dozens of kid-friendly templates — animals, superheroes, fantasy characters, sports players — or start with a blank canvas for total freedom.',
                },
                {
                  step: '2',
                  title: 'Paint & Customize',
                  desc: 'Use simple drawing tools (brush, fill bucket, eraser, color picker) to design your skin pixel by pixel. The layer system lets you add details like hats, capes, and accessories on separate layers.',
                },
                {
                  step: '3',
                  title: 'Try AI Suggestions',
                  desc: 'Stuck on colors? Let the AI suggest palettes that work well together. It can recommend complementary colors and shading to make your skin look professional.',
                },
                {
                  step: '4',
                  title: 'Preview in 3D',
                  desc: 'Spin your character around in the live 3D preview to see how the skin looks from every angle. Check the front, back, and sides before you finalize.',
                },
                {
                  step: '5',
                  title: 'Download & Upload to Minecraft',
                  desc: 'Hit the download button to save your skin as a PNG file. Then upload it to your Minecraft account through the launcher or minecraft.net — done!',
                },
              ].map((s) => (
                <div key={s.step} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg">
                    {s.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{s.title}</h3>
                    <p className="text-white/70 text-sm mt-1">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Safety features */}
          <section className="rounded-3xl bg-white/5 border border-white/10 p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-3xl">🛡️</span> Safety Features Parents Will Love
            </h2>
            <p className="text-white/80 leading-relaxed mb-6">
              We built this tool with families in mind. Here&apos;s what makes our skin creator a safe space for kids:
            </p>
            <ul className="space-y-3 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">✓</span>
                <span>
                  <strong className="text-white">Zero Ads</strong> — no banners, no pop-ups, no sponsored content.
                  Kids see only the editor.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">✓</span>
                <span>
                  <strong className="text-white">No Account Required</strong> — we don&apos;t collect names, emails,
                  or any personal data. Ever.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">✓</span>
                <span>
                  <strong className="text-white">Runs Locally in the Browser</strong> — nothing is uploaded to our
                  servers. The skin stays on your device until you choose to download it.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">✓</span>
                <span>
                  <strong className="text-white">No Social Features</strong> — there&apos;s no chat, no community
                  gallery, no way for strangers to interact with your child.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">✓</span>
                <span>
                  <strong className="text-white">COPPA-Friendly Design</strong> — we follow best practices for
                  children&apos;s online privacy and safety.
                </span>
              </li>
            </ul>
          </section>

          {/* What makes it different */}
          <section className="rounded-3xl bg-white/5 border border-white/10 p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">✨</span> What Makes Our Editor Different
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  emoji: '🎨',
                  title: 'Kid-Friendly Interface',
                  desc: 'Big buttons, simple tools, and a clean layout designed for young creators',
                },
                {
                  emoji: '🔄',
                  title: 'Real-Time 3D Preview',
                  desc: 'See your skin from every angle as you paint — instant visual feedback',
                },
                {
                  emoji: '🤖',
                  title: 'AI Color Assistant',
                  desc: 'Smart color suggestions help kids create professional-looking skins',
                },
                {
                  emoji: '📚',
                  title: 'Template Library',
                  desc: 'Dozens of fun starter templates so kids never face a blank canvas',
                },
                {
                  emoji: '📱',
                  title: 'Works on Any Device',
                  desc: 'Desktop, tablet, phone — create skins wherever inspiration strikes',
                },
                {
                  emoji: '🎮',
                  title: 'Multi-Game Export',
                  desc: 'Skins work with Minecraft Java, Bedrock, and other supported games',
                },
              ].map((f) => (
                <div key={f.title} className="flex gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-2xl flex-shrink-0">{f.emoji}</span>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{f.title}</h3>
                    <p className="text-white/60 text-sm mt-1">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Mid-article CTA */}
          <div className="text-center py-4">
            <Link
              href="/games/skin-creator/"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold text-lg shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105 transition-all duration-300"
            >
              ✨ Try the Skin Creator Now — Free!
            </Link>
          </div>

          {/* FAQ */}
          <section className="rounded-3xl bg-white/5 border border-white/10 p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">❓</span> Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqItems.map((item, i) => (
                <div key={i} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
                  <h3 className="font-semibold text-white mb-2">{item.question}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related links */}
          <section className="rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-3xl">🔗</span> More Minecraft Resources
            </h2>
            <p className="text-white/70 mb-6">
              Explore our other Minecraft tools and guides:
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: '🎨 Skin Creator', href: '/games/skin-creator/' },
                { label: '📝 Skin Creator Guide', href: '/blog/skin-creator-minecraft/' },
                { label: '⛏️ All Minecraft Tools', href: '/games/minecraft/' },
                { label: '📛 Name Generator', href: '/games/name-generator/' },
                { label: '⚒️ Crafting Guide', href: '/games/crafting-guide/' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white/90 text-sm font-medium hover:bg-white/20 hover:border-white/20 transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>

          {/* Final CTA */}
          <div className="text-center pt-8">
            <Link
              href="/games/skin-creator/"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-xl shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-300"
            >
              🎨 Start Creating Your Skin Now
            </Link>
            <p className="text-white/50 text-sm mt-4">Free forever. No signup. Kid-safe.</p>
          </div>
        </motion.div>
      </article>
    </div>
  )
}
