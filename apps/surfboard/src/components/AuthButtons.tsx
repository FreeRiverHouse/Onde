"use client"

import { signIn, signOut } from "next-auth/react"
import type { Session } from "next-auth"

interface AuthButtonsProps {
  session: Session | null
}

export function AuthButtons({ session }: AuthButtonsProps) {
  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-surf-foam/60">
          {session.user.email?.split("@")[0]}
        </span>
        <button
          onClick={() => signOut()}
          className="text-sm text-surf-foam/40 hover:text-red-400 transition-colors"
        >
          Esci
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="text-sm text-surf-foam/60 hover:text-surf-cyan transition-colors"
    >
      Accedi
    </button>
  )
}
