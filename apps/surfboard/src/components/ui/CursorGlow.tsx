'use client'

import { useEffect, useState } from 'react'

export function CursorGlow() {
  const [position, setPosition] = useState({ x: -100, y: -100 })
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
    }
    
    const handleMouseLeave = () => {
      setIsVisible(false)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    document.body.addEventListener('mouseleave', handleMouseLeave)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.body.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])
  
  return (
    <>
      {/* Large ambient glow */}
      <div
        className="fixed pointer-events-none transition-opacity duration-500"
        style={{
          left: position.x,
          top: position.y,
          width: 600,
          height: 600,
          marginLeft: -300,
          marginTop: -300,
          background: `radial-gradient(
            circle,
            rgba(6, 182, 212, 0.08) 0%,
            rgba(139, 92, 246, 0.05) 30%,
            transparent 70%
          )`,
          opacity: isVisible ? 1 : 0,
          zIndex: 0,
        }}
      />
      
      {/* Medium glow ring */}
      <div
        className="fixed pointer-events-none transition-opacity duration-300"
        style={{
          left: position.x,
          top: position.y,
          width: 200,
          height: 200,
          marginLeft: -100,
          marginTop: -100,
          background: `radial-gradient(
            circle,
            rgba(6, 182, 212, 0.15) 0%,
            rgba(6, 182, 212, 0.05) 40%,
            transparent 70%
          )`,
          opacity: isVisible ? 1 : 0,
          zIndex: 1,
        }}
      />
      
      {/* Core glow */}
      <div
        className="fixed pointer-events-none transition-opacity duration-200"
        style={{
          left: position.x,
          top: position.y,
          width: 40,
          height: 40,
          marginLeft: -20,
          marginTop: -20,
          background: `radial-gradient(
            circle,
            rgba(6, 182, 212, 0.4) 0%,
            rgba(6, 182, 212, 0.1) 50%,
            transparent 100%
          )`,
          opacity: isVisible ? 1 : 0,
          zIndex: 2,
          filter: 'blur(4px)',
        }}
      />
    </>
  )
}
