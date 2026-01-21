"use client"

import { ThemeToggleMinimal } from './ThemeToggle'
import { CommandPalette } from './CommandPalette'

export function HeaderClient() {
  return (
    <>
      <ThemeToggleMinimal />
      <CommandPalette />
    </>
  )
}
