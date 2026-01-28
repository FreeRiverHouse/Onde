"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

interface SpotlightProps {
  className?: string
  fill?: string
}

export function Spotlight({ className, fill = "white" }: SpotlightProps) {
  return (
    <svg
      className={cn(
        "animate-spotlight pointer-events-none absolute z-[1] h-[169%] w-[138%] lg:w-[84%] opacity-0",
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <g filter="url(#filter)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill={fill}
          fillOpacity="0.21"
        />
      </g>
      <defs>
        <filter
          id="filter"
          x="0.860352"
          y="0.838989"
          width="3785.16"
          height="2840.26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="151"
            result="effect1_foregroundBlur_1065_8"
          />
        </filter>
      </defs>
    </svg>
  )
}

// Aurora background effect
export function Aurora({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <div className="absolute -inset-[10px] opacity-50">
        <div
          className="absolute top-0 -left-4 w-72 h-72 bg-onde-coral rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"
        />
        <div
          className="absolute top-0 -right-4 w-72 h-72 bg-onde-teal rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
        />
        <div
          className="absolute -bottom-8 left-20 w-72 h-72 bg-onde-gold rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"
        />
      </div>
    </div>
  )
}

// Glowing border effect
export function GlowingBorder({ 
  children, 
  className,
  glowColor = "coral"
}: { 
  children: React.ReactNode
  className?: string
  glowColor?: "coral" | "teal" | "gold" | "ocean"
}) {
  const colors = {
    coral: "from-onde-coral via-onde-gold to-onde-coral",
    teal: "from-onde-teal via-onde-blue to-onde-teal",
    gold: "from-onde-gold via-onde-coral to-onde-gold",
    ocean: "from-onde-ocean via-onde-teal to-onde-ocean",
  }

  return (
    <div className={cn("relative group", className)}>
      <div className={cn(
        "absolute -inset-0.5 bg-gradient-to-r rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-shift",
        colors[glowColor]
      )} />
      <div className="relative">
        {children}
      </div>
    </div>
  )
}

// Floating orbs background
export function FloatingOrbs({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-orb-float"
          style={{
            width: `${150 + i * 50}px`,
            height: `${150 + i * 50}px`,
            left: `${10 + i * 15}%`,
            top: `${10 + (i % 3) * 30}%`,
            background: i % 3 === 0 
              ? 'rgba(212, 175, 55, 0.1)' 
              : i % 3 === 1 
                ? 'rgba(91, 154, 160, 0.1)' 
                : 'rgba(38, 97, 156, 0.1)',
            filter: 'blur(40px)',
            animationDelay: `${i * 2}s`,
          }}
        />
      ))}
    </div>
  )
}
