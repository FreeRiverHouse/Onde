'use client'

import GameWrapper, { useGameContext } from '@/app/games/components/GameWrapper'

function MoonlightMagicHouseInner() {
  return (
    <div className="w-full h-screen">
      <iframe 
        src="/static-games/moonlight-magic-house/index.html"
        className="w-full h-full border-0"
        title="Moonlight Magic House"
        allow="fullscreen"
      />
    </div>
  )
}


// ============================================
// Game Wrapper with XP + Coins tracking
// ============================================
export default function MoonlightMagicHouse() {
  return (
    <GameWrapper gameName="Moonlight Magic House" gameId="moonlight-magic-house" emoji={"🏠"}>
      <MoonlightMagicHouseInner />
    </GameWrapper>
  )
}
