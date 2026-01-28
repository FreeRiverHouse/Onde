'use client'

import dynamic from 'next/dynamic'

// Dynamic imports with SSR disabled for canvas-based components
const AuroraBackground = dynamic(
  () => import('./AuroraBackground').then(mod => ({ default: mod.AuroraBackground })),
  { ssr: false }
)

const InteractiveDotGrid = dynamic(
  () => import('./InteractiveDotGrid').then(mod => ({ default: mod.InteractiveDotGrid })),
  { ssr: false }
)

const LiquidBlobs = dynamic(
  () => import('./LiquidBlobs').then(mod => ({ default: mod.LiquidBlobs })),
  { ssr: false }
)

const CursorGlow = dynamic(
  () => import('./CursorGlow').then(mod => ({ default: mod.CursorGlow })),
  { ssr: false }
)

export function BackgroundEffects() {
  return (
    <>
      <LiquidBlobs />
      <AuroraBackground />
      <InteractiveDotGrid />
      <CursorGlow />
    </>
  )
}
