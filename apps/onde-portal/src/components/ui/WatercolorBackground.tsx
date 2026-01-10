'use client'

import { motion } from 'framer-motion'

interface WatercolorBlobProps {
  color: 'coral' | 'teal' | 'gold' | 'blue'
  size: number
  x: string
  y: string
  delay?: number
}

const colorMap = {
  coral: 'rgba(255, 127, 127, 0.4)',
  teal: 'rgba(72, 201, 176, 0.35)',
  gold: 'rgba(244, 208, 63, 0.35)',
  blue: 'rgba(93, 173, 226, 0.3)',
}

function WatercolorBlob({ color, size, x, y, delay = 0 }: WatercolorBlobProps) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: colorMap[color],
        filter: 'blur(80px)',
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: [0.3, 0.5, 0.3],
        scale: [1, 1.1, 1],
        x: [0, 20, 0],
        y: [0, -10, 0],
      }}
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

export default function WatercolorBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Ambient gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg,
              rgba(253, 246, 227, 1) 0%,
              rgba(255, 255, 255, 0.9) 50%,
              rgba(253, 246, 227, 0.8) 100%
            )
          `,
        }}
      />

      {/* Watercolor blobs */}
      <WatercolorBlob color="coral" size={400} x="5%" y="10%" delay={0} />
      <WatercolorBlob color="teal" size={350} x="70%" y="60%" delay={2} />
      <WatercolorBlob color="gold" size={300} x="50%" y="30%" delay={4} />
      <WatercolorBlob color="blue" size={280} x="80%" y="10%" delay={1} />
      <WatercolorBlob color="coral" size={250} x="20%" y="70%" delay={3} />
      <WatercolorBlob color="teal" size={200} x="10%" y="50%" delay={5} />

      {/* Subtle grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
