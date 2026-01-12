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
        
        {/* LEFT SIDE - SURF DEV (Tempesta, onde fortissime) */}
        <Link 
          href="/dev"
          className="relative w-1/2 h-full group cursor-pointer overflow-hidden"
        >
          {/* ULTRA MODERN Animated Mesh Gradient - Tempesta */}
          <div className="absolute inset-0">
            {/* Layer 1: Base mesh gradient */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(at 0% 0%, rgba(255, 193, 7, 0.4) 0px, transparent 50%),
                  radial-gradient(at 100% 0%, rgba(255, 152, 0, 0.3) 0px, transparent 50%),
                  radial-gradient(at 100% 100%, rgba(33, 150, 243, 0.4) 0px, transparent 50%),
                  radial-gradient(at 0% 100%, rgba(63, 81, 181, 0.5) 0px, transparent 50%),
                  radial-gradient(at 50% 50%, rgba(156, 39, 176, 0.3) 0px, transparent 50%),
                  linear-gradient(135deg, #0a0e27 0%, #1a237e 25%, #0d47a1 50%, #01579b 75%, #004d40 100%)
                `,
                backgroundSize: '200% 200%'
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            
            {/* Layer 2: Moving orbs */}
            <motion.div
              className="absolute w-[600px] h-[600px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255, 193, 7, 0.6) 0%, transparent 70%)',
                filter: 'blur(80px)',
                left: '-200px',
                top: '-200px'
              }}
              animate={{
                x: [0, 300, 0],
                y: [0, 200, 0],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            
            <motion.div
              className="absolute w-[500px] h-[500px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(33, 150, 243, 0.5) 0%, transparent 70%)',
                filter: 'blur(100px)',
                right: '-150px',
                bottom: '-150px'
              }}
              animate={{
                x: [0, -200, 0],
                y: [0, -150, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1
              }}
            />
            
            {/* Layer 3: Glassmorphism overlay */}
            <div 
              className="absolute inset-0 backdrop-blur-[1px] bg-gradient-to-br from-black/30 via-transparent to-black/40 group-hover:backdrop-blur-0 transition-all duration-700"
              style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(255,193,7,0.05) 50%, rgba(33,150,243,0.05) 100%)'
              }}
            />
            
            {/* Layer 4: Noise texture */}
            <div 
              className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
                backgroundSize: '200px 200px'
              }}
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

        {/* RIGHT SIDE - LA PREPROD (Acqua tranquilla, palme) */}
        <Link 
          href="/preprod"
          className="relative w-1/2 h-full group cursor-pointer overflow-hidden"
        >
          {/* ULTRA MODERN Animated Mesh Gradient - Calma */}
          <div className="absolute inset-0">
            {/* Layer 1: Base mesh gradient */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(at 0% 0%, rgba(78, 205, 196, 0.4) 0px, transparent 50%),
                  radial-gradient(at 100% 0%, rgba(16, 185, 129, 0.3) 0px, transparent 50%),
                  radial-gradient(at 100% 100%, rgba(5, 150, 105, 0.4) 0px, transparent 50%),
                  radial-gradient(at 0% 100%, rgba(0, 150, 136, 0.5) 0px, transparent 50%),
                  radial-gradient(at 50% 50%, rgba(0, 188, 212, 0.3) 0px, transparent 50%),
                  linear-gradient(135deg, #0a2e1f 0%, #064e3b 25%, #047857 50%, #059669 75%, #10b981 100%)
                `,
                backgroundSize: '200% 200%'
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            
            {/* Layer 2: Moving orbs */}
            <motion.div
              className="absolute w-[700px] h-[700px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(78, 205, 196, 0.5) 0%, transparent 70%)',
                filter: 'blur(100px)',
                left: '-250px',
                top: '-250px'
              }}
              animate={{
                x: [0, 250, 0],
                y: [0, 180, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            
            <motion.div
              className="absolute w-[600px] h-[600px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)',
                filter: 'blur(120px)',
                right: '-200px',
                bottom: '-200px'
              }}
              animate={{
                x: [0, -180, 0],
                y: [0, -120, 0],
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 22,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1.5
              }}
            />
            
            {/* Layer 3: Glassmorphism overlay */}
            <div 
              className="absolute inset-0 backdrop-blur-[1px] bg-gradient-to-br from-black/20 via-transparent to-black/30 group-hover:backdrop-blur-0 transition-all duration-700"
              style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(78,205,196,0.05) 50%, rgba(16,185,129,0.05) 100%)'
              }}
            />
            
            {/* Layer 4: Noise texture */}
            <div 
              className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
                backgroundSize: '180px 180px'
              }}
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
                LA
              </h1>
              <p className="text-2xl mb-2 text-emerald-400 font-semibold drop-shadow-lg">
                Pre-Production
              </p>
              <p className="text-lg text-gray-200 max-w-md drop-shadow-lg">
                Acqua tranquilla • Palme • Simula onde.la per testing
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
