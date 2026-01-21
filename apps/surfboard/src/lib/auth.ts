import type { NextAuthOptions, Session } from "next-auth"
import { getServerSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import type { JWT } from "next-auth/jwt"

// Extend the session types
declare module "next-auth" {
  interface Session {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

// Whitelist of allowed email addresses
const ALLOWED_EMAILS = [
  "mattiapetrucciani@gmail.com",
  "mattiapetrucciani@mac.com",
  "mattia@freeriverhouse.com",
  "mattia@onde.la",
  // Add more emails as needed
]

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Only allow whitelisted emails
      if (user.email && ALLOWED_EMAILS.includes(user.email)) {
        return true
      }
      // Redirect to coming-soon page for non-whitelisted users
      return "/coming-soon"
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Add user id to session
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
}

export async function auth() {
  return await getServerSession(authOptions)
}

export function isAuthorizedEmail(email: string | null | undefined): boolean {
  return email ? ALLOWED_EMAILS.includes(email) : false
}
