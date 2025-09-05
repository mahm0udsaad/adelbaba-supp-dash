import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"

async function exchangeWithBackend(params: { provider: "google" | "facebook"; token: string }) {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const url = `${base.replace(/\/$/, "")}/api/v1/login/social`
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ provider: params.provider, token: params.token }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Backend social login failed: ${res.status} ${text}`)
  }
  return res.json() as Promise<any>
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_APP_ID || process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "",
      clientSecret: process.env.FACEBOOK_APP_SECRET || "",
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && (account.provider === "google" || account.provider === "facebook")) {
        const idToken = (account as any).id_token as string | undefined
        const accessToken = (account as any).access_token as string | undefined
        const providerToken = idToken || accessToken
        if (providerToken) {
          const data = await exchangeWithBackend({ provider: account.provider as any, token: providerToken })
          token.appToken = data?.token
          token.appUser = data?.user
          token.roles = data?.roles || []
          token.completionStatus = data?.completion_status || null
        }
      }
      return token
    },
    async session({ session, token }) {
      ;(session as any).token = (token as any).appToken
      ;(session as any).user = (token as any).appUser || session.user
      ;(session as any).roles = (token as any).roles || []
      ;(session as any).completionStatus = (token as any).completionStatus || null
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default authOptions


