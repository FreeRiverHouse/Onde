import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Routes that don't require authentication
const publicRoutes = ["/login", "/coming-soon", "/api/auth", "/api/sync", "/api/agent-tasks", "/api/house", "/api/pr", "/api/activity", "/frh", "/betting", "/api/crypto", "/api/inbox", "/api/kalshi", "/api/momentum", "/api/trading", "/health", "/api/health"]

// Check if a path is public
function isPublicPath(pathname: string): boolean {
  // Allow static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return true
  }

  // Check public routes
  return publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route + "/")
  )
}

// Simplified middleware - just check cookies for session
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Check for session cookie (Auth.js v5 format)
  const sessionToken = req.cookies.get("__Secure-authjs.session-token")?.value ||
                       req.cookies.get("authjs.session-token")?.value

  // If no session, redirect to login
  if (!sessionToken) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
