import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

// Routes that don't require authentication
const publicRoutes = ["/login", "/coming-soon", "/api/auth"]

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Check if this is a public route
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route + "/")
  )

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Allow static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Check if user is authenticated - must have a valid user with email
  const isAuthenticated = req.auth?.user?.email

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
