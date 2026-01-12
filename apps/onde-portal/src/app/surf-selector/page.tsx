'use client'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function SurfSelector() {
  const [mounted, setMounted] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e
    const { innerWidth, innerHeight } = window
    mouseX.set(clientX / innerWidth)
    mouseY.set(clientY / innerHeight)
  }

  if (!mounted) return null

  return (
    <div 
      className="fixed inset-0 w-full h-full overflow-hidden bg-black"
      onMouseMove={handleMouseMove}
    >
      {/* Split Screen Container */}
      <div className="flex w-full h-full relative">
        
        {/* LEFT SIDE - PORTALE VR (Tempesta, onde fortissime) */}
        <Link 
          href="/vr"
          className="relative w-1/2 h-full group cursor-pointer overflow-hidden"
        >
          {/* Video Background - Storm Waves */}
          <div className="absolute inset-0">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/videos/ocean-waves-storm.mp4" type="video/mp4" />
            </video>
            
            {/* Overlay gradient for better text readability */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-black/50 group-hover:from-black/30 group-hover:to-black/40 transition-all duration-500"
            />
            
            {/* Color tint overlay */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-blue-600/20 mix-blend-overlay"
            />
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
                VR
              </h1>
              <p className="text-2xl mb-2 text-yellow-400 font-semibold drop-shadow-lg">
                Portale VR
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

        {/* RIGHT SIDE - LA PREPROD (Acqua tranquilla, palme) */}
        <Link 
          href="/preprod"
          className="relative w-1/2 h-full group cursor-pointer overflow-hidden"
        >
          {/* Video Background - Calm Turquoise Ocean */}
          <div className="absolute inset-0">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/videos/ocean-peaceful-sunset.mp4" type="video/mp4" />
            </video>
            
            {/* Overlay gradient for better text readability */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/10 to-black/40 group-hover:from-black/20 group-hover:to-black/30 transition-all duration-500"
            />
            
            {/* Color tint overlay - turchese/azzurro */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-600/15 mix-blend-overlay"
            />
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
                ONDE.LA
              </h1>
              <p className="text-2xl mb-2 text-emerald-400 font-semibold drop-shadow-lg">
                Pre-Production
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
