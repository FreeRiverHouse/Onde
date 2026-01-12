'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function SurfSelector() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      {/* Split Screen Container */}
      <div className="flex w-full h-full">
        
        {/* LEFT SIDE - SURF DEV (Tempesta, onde fortissime) */}
        <Link 
          href="/dev"
          className="relative w-1/2 h-full group cursor-pointer overflow-hidden"
        >
          {/* Animated Background - Tempesta onde fortissime */}
          <div className="absolute inset-0">
            <motion.div
              className="w-full h-full"
              style={{
                background: `
                  radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255, 193, 7, 0.3) 0%, transparent 50%),
                  radial-gradient(ellipse 100% 80% at 0% 50%, rgba(33, 150, 243, 0.4) 0%, transparent 50%),
                  radial-gradient(ellipse 100% 80% at 100% 50%, rgba(63, 81, 181, 0.4) 0%, transparent 50%),
                  linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)
                `
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center px-8"
            >
              {/* Icon - Lightning/Storm */}
              <motion.div
                className="mb-8"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <svg 
                  className="w-32 h-32 mx-auto text-yellow-400 drop-shadow-2xl"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
                </svg>
              </motion.div>

              {/* Title */}
              <h1 className="text-6xl font-bold mb-4 drop-shadow-2xl">
                SURF
              </h1>
              <p className="text-2xl mb-2 text-yellow-400 font-semibold drop-shadow-lg">
                Development
              </p>
              <p className="text-lg text-gray-200 max-w-md drop-shadow-lg">
                Tempesta di sviluppo • Onde fortissime • Ambiente di test
              </p>

              {/* Hover indicator */}
              <motion.div
                className="mt-12 text-sm uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ y: 10 }}
                whileHover={{ y: 0 }}
              >
                Click to enter →
              </motion.div>
            </motion.div>
          </div>

          {/* Animated border on hover */}
          <motion.div
            className="absolute inset-0 border-4 border-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={false}
          />
        </Link>

        {/* DIVIDER LINE */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-white to-transparent z-20" />

        {/* RIGHT SIDE - LA PROD (Acqua tranquilla, palme) */}
        <Link 
          href="/"
          className="relative w-1/2 h-full group cursor-pointer overflow-hidden"
        >
          {/* Animated Background - Acqua tranquilla palme */}
          <div className="absolute inset-0">
            <motion.div
              className="w-full h-full"
              style={{
                background: `
                  radial-gradient(ellipse 80% 50% at 50% 0%, rgba(78, 205, 196, 0.3) 0%, transparent 50%),
                  radial-gradient(ellipse 100% 80% at 0% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 50%),
                  radial-gradient(ellipse 100% 80% at 100% 50%, rgba(5, 150, 105, 0.3) 0%, transparent 50%),
                  linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)
                `
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
            {/* Light overlay */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all duration-500" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center px-8"
            >
              {/* Icon - Palm/Calm */}
              <motion.div
                className="mb-8"
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <svg 
                  className="w-32 h-32 mx-auto text-emerald-400 drop-shadow-2xl"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                </svg>
              </motion.div>

              {/* Title */}
              <h1 className="text-6xl font-bold mb-4 drop-shadow-2xl">
                LA
              </h1>
              <p className="text-2xl mb-2 text-emerald-400 font-semibold drop-shadow-lg">
                Production
              </p>
              <p className="text-lg text-gray-200 max-w-md drop-shadow-lg">
                Acqua tranquilla • Palme • Ambiente di produzione
              </p>

              {/* Hover indicator */}
              <motion.div
                className="mt-12 text-sm uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ y: 10 }}
                whileHover={{ y: 0 }}
              >
                Click to enter →
              </motion.div>
            </motion.div>
          </div>

          {/* Animated border on hover */}
          <motion.div
            className="absolute inset-0 border-4 border-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={false}
          />
        </Link>
      </div>

      {/* Top Logo/Brand */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold text-white drop-shadow-2xl mb-2">
            ONDE.SURF
          </h2>
          <p className="text-sm text-gray-200 drop-shadow-lg uppercase tracking-wider">
            Choose Your Environment
          </p>
        </motion.div>
      </div>
    </div>
  )
}
