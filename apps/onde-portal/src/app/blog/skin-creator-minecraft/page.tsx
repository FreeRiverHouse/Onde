'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Breadcrumb from '@/components/ui/Breadcrumb'

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

export default function SkinCreatorBlogPost() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[150px] opacity-15 bg-gradient-to-br from-green-500 to-emerald-500" style={{ left: '-10%', top: '10%' }} />
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[150px] opacity-15 bg-gradient-to-br from-violet-500 to-purple-500" style={{ right: '-5%', top: '40%' }} />
      </div>

      {/* Breadcrumb */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
        <Breadcrumb items={[
          { label: 'Home', href: '/', emoji: '🏠' },
          { label: 'Blog', href: '/blog', emoji: '📝' },
          { label: 'Skin Creator', emoji: '🎨' },
        ]} />
      </div>

      {/* Article */}
      <article className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        {/* Hero */}
        <motion.header className="mb-12 text-center" {...fadeIn} transition={{ delay: 0.1 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Free Tool
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-6">
            <span className="text-white">Create Your Perfect </span>
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Minecraft Skin
            </span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Design unique skins with our free online creator — 3D preview, layer system, templates, and AI-powered tools. No download required.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-white/50">
            <span>February 2026</span>
            <span>•</span>
            <span>4 min read</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded bg-white/10">Design</span>
          </div>
        </motion.header>

        {/* CTA Button */}
        <motion.div className="text-center mb-16" {...fadeIn} transition={{ delay: 0.2 }}>
          <Link
            href="/games/skin-creator/"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105 transition-all duration-300"
          >
            🎨 Open Skin Creator — It&apos;s Free!
          </Link>
        </motion.div>

        {/* Content */}
        <motion.div className="space-y-12" {...fadeIn} transition={{ delay: 0.3 }}>

          {/* What is it */}
          <section className="rounded-3xl bg-white/5 border border-white/10 p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-3xl">🎮</span> What is the Skin Creator?
            </h2>
            <p className="text-white/80 leading-relaxed mb-4">
              Our <strong className="text-white">Minecraft Skin Creator</strong> is a free, browser-based tool that lets you design custom skins for Minecraft. No downloads, no signups, no ads — just open it and start creating.
            </p>
            <p className="text-white/80 leading-relaxed">
              Whether you&apos;re building your first skin or you&apos;re a pixel art pro, the creator has everything you need: a powerful canvas editor, real-time 3D preview, layer system, and dozens of templates to get you started.
            </p>
          </section>

          {/* Features */}
          <section className="rounded-3xl bg-white/5 border border-white/10 p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">✨</span> Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { emoji: '🖌️', title: 'Pixel Canvas Editor', desc: 'Paint, erase, fill, pick colors, draw lines — all the tools you need' },
                { emoji: '🔄', title: 'Live 3D Preview', desc: 'See your skin in real-time from every angle with Three.js rendering' },
                { emoji: '📚', title: 'Layer System', desc: 'Work with multiple layers — just like Photoshop, but for Minecraft skins' },
                { emoji: '🎭', title: 'Templates Gallery', desc: '10+ pre-made templates to kickstart your design' },
                { emoji: '🤖', title: 'AI Color Suggestions', desc: 'Let AI help you find the perfect color palette for your skin' },
                { emoji: '📱', title: 'Mobile Friendly', desc: 'Works great on phones and tablets — create skins anywhere' },
                { emoji: '🎮', title: 'Multi-Game Support', desc: 'Minecraft Java, Bedrock, Roblox, Fortnite, and Among Us' },
                { emoji: '💾', title: 'Easy Export', desc: 'Download PNG, copy to clipboard, or import from NameMC' },
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

          {/* How to use */}
          <section className="rounded-3xl bg-white/5 border border-white/10 p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">🚀</span> How to Create Your Skin
            </h2>
            <div className="space-y-6">
              {[
                { step: '1', title: 'Choose a Template', desc: 'Pick a starting template or start from scratch. We have skins for every style — warriors, wizards, animals, and more.' },
                { step: '2', title: 'Customize Your Design', desc: 'Use the pixel editor to paint your skin. Add layers for details like armor, accessories, or patterns.' },
                { step: '3', title: 'Preview in 3D', desc: 'Rotate and zoom the 3D preview to see your skin from every angle. Try different poses!' },
                { step: '4', title: 'Download & Play', desc: 'Export your skin as a PNG file and upload it to Minecraft. Works with both Java and Bedrock editions.' },
              ].map((s) => (
                <div key={s.step} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold shadow-lg">
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

          {/* Why Onde */}
          <section className="rounded-3xl bg-white/5 border border-white/10 p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-3xl">🌊</span> Why Use Onde&apos;s Skin Creator?
            </h2>
            <ul className="space-y-3 text-white/80">
              <li className="flex items-start gap-2"><span className="text-green-400 mt-1">✓</span> <span><strong className="text-white">100% Free</strong> — no premium tiers, no paywalls, no hidden costs</span></li>
              <li className="flex items-start gap-2"><span className="text-green-400 mt-1">✓</span> <span><strong className="text-white">No Account Required</strong> — just open and start creating</span></li>
              <li className="flex items-start gap-2"><span className="text-green-400 mt-1">✓</span> <span><strong className="text-white">Kid-Friendly</strong> — safe for all ages, no ads, no tracking</span></li>
              <li className="flex items-start gap-2"><span className="text-green-400 mt-1">✓</span> <span><strong className="text-white">Works Everywhere</strong> — desktop, tablet, or phone</span></li>
              <li className="flex items-start gap-2"><span className="text-green-400 mt-1">✓</span> <span><strong className="text-white">Fast & Private</strong> — runs entirely in your browser, nothing uploaded</span></li>
            </ul>
          </section>

          {/* More games */}
          <section className="rounded-3xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-3xl">🎲</span> More Minecraft Tools
            </h2>
            <p className="text-white/70 mb-6">Check out our full Minecraft toolkit:</p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: '🎨 Skin Creator', href: '/games/skin-creator/' },
                { label: '📛 Name Generator', href: '/games/name-generator/' },
                { label: '⚒️ Crafting Guide', href: '/games/crafting-guide/' },
                { label: '✨ Enchant Calculator', href: '/games/enchant-calc/' },
                { label: '⛏️ All Minecraft Tools', href: '/games/minecraft/' },
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
              className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-xl shadow-xl shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105 transition-all duration-300"
            >
              🎨 Start Creating Your Skin Now
            </Link>
            <p className="text-white/50 text-sm mt-4">Free forever. No signup needed.</p>
          </div>

        </motion.div>
      </article>
    </div>
  )
}
