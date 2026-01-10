'use client'

import { useEffect, useState } from 'react'

interface WatercolorBlobProps {
  color: 'coral' | 'teal' | 'gold' | 'blue'
  size: number
  mobileSize: number
  x: string
  y: string
}

const colorMap = {
  coral: 'rgba(255, 127, 127, 0.35)',
  teal: 'rgba(72, 201, 176, 0.3)',
  gold: 'rgba(244, 208, 63, 0.3)',
  blue: 'rgba(93, 173, 226, 0.25)',
}

function WatercolorBlob({ color, size, mobileSize, x, y }: WatercolorBlobProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const actualSize = isMobile ? mobileSize : size

  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: actualSize,
        height: actualSize,
        left: x,
        top: y,
        background: colorMap[color],
        filter: 'blur(60px)',
        opacity: 0.4,
        transform: 'translate3d(0,0,0)', /* Force GPU layer */
      }}
    />
  )
}

export default function WatercolorBackground() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      style={{
        contain: 'strict', /* CSS containment for performance */
        willChange: 'auto',
      }}
      aria-hidden="true"
    >
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

      {/* Static watercolor blobs - no animation for mobile stability */}
      <WatercolorBlob color="coral" size={400} mobileSize={200} x="5%" y="10%" />
      <WatercolorBlob color="teal" size={350} mobileSize={180} x="70%" y="60%" />
      <WatercolorBlob color="gold" size={300} mobileSize={150} x="50%" y="30%" />
      <WatercolorBlob color="blue" size={280} mobileSize={140} x="75%" y="10%" />
      <WatercolorBlob color="coral" size={250} mobileSize={120} x="20%" y="70%" />
      <WatercolorBlob color="teal" size={200} mobileSize={100} x="10%" y="50%" />

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
