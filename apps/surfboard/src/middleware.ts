import { NextResponse } from "next/server"
import { auth } from "./lib/auth"

// Routes that don't require authentication
const publicRoutes = ["/login", "/coming-soon", "/api/auth", "/api/sync", "/api/agent-tasks", "/api/house", "/api/pr", "/api/activity", "/frh"]

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

// Main middleware using NextAuth v5 auth wrapper
export default auth((req) => {
  const { pathname } = req.nextUrl

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // For protected routes, check if user is authenticated
  if (!req.auth?.user?.email) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
