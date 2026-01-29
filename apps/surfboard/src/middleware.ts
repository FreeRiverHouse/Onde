import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Middleware semplificato - niente auth, tutto pubblico (come onde.la)
export async function middleware(_req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
