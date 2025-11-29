import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import CredentialsProvider from "next-auth/providers/credentials"

async function exchangeWithBackend(params: { provider: "google" | "facebook"; token: string }) {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const url = `${base}/api/v1/company/login/social`
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", "X-Country": "EG" },
    body: JSON.stringify({ provider: params.provider, token: params.token }),
  })
  if (!res.ok) {
    const text = await res.text()
    console.error("[NextAuth] /login/social backend error:", { status: res.status, body: text })
    throw new Error(`Backend social login failed: ${res.status} ${text}`)
  }
  const data = await res.json() as any
  if (process.env.NODE_ENV !== "production") {
    const safe = { ...data, token: data?.token ? "[REDACTED]" : undefined }
    console.log("[NextAuth] /login/social response:", {
      provider: params.provider,
      keys: Object.keys(data || {}),
      user: data?.user?.email,
      roles: data?.roles,
      hasToken: !!data?.token,
      hasCompany: !!data?.company,
      raw: safe,
    })
  }
  return data as any
}

async function loginWithBackend(params: { email: string; password: string }) {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const url = `${base}/api/v1/company/login`
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", "X-Country": "EG" },
    body: JSON.stringify({ email: params.email, password: params.password }),
  })
  if (!res.ok) {
    const text = await res.text()
    console.error("[NextAuth] /login backend error:", { status: res.status, body: text })
    throw new Error(`Backend login failed: ${res.status} ${text}`)
  }
  const data = await res.json() as any
  if (process.env.NODE_ENV !== "production") {
    const safe = { ...data, token: data?.token ? "[REDACTED]" : undefined }
    console.log("[NextAuth] /login response:", {
      keys: Object.keys(data || {}),
      user: data?.user?.email,
      roles: data?.roles,
      hasToken: !!data?.token,
      hasCompany: !!data?.company,
      raw: safe,
    })
  }
  return data as any
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
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          const data = await loginWithBackend({ email: credentials.email, password: credentials.password })
          if (process.env.NODE_ENV !== "production") {
            const safe = { ...data, token: data?.token ? "[REDACTED]" : undefined }
            console.log("[NextAuth] Credentials authorize mapped user:", {
              userEmail: data?.user?.email,
              roles: data?.roles,
              hasToken: !!data?.token,
              hasCompany: !!data?.company,
              raw: safe,
            })
          }
          
          // Save authentication data to localStorage for persistence
          if (typeof window !== "undefined") {
            try {
              const authData = {
                user: data?.user,
                company: data?.company,
                roles: data?.roles || [],
                completionStatus: data?.completion_status || null,
                token: data?.token,
              }
              localStorage.setItem("adelbaba_auth_data", JSON.stringify(authData))
              
              // Save company data separately if it exists
              if (data?.company) {
                localStorage.setItem("adelbaba_company_data", JSON.stringify(data.company))
              }
            } catch (error) {
              console.error("Failed to save auth data to localStorage:", error)
            }
          }
          const user = {
            ...data?.user,
            appToken: data?.token,
            roles: data?.roles || [],
            completionStatus: data?.completion_status || null,
            company: data?.company || null,
          }
          return user as any
        } catch (error) {
          // Throw to let NextAuth show an error
          throw error as any
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      // Handle credentials login
      if (user && (account?.provider === "credentials" || !account)) {
        token.appToken = (user as any).appToken
        token.appUser = {
          id: (user as any).id,
          name: (user as any).name,
          email: (user as any).email,
          picture: (user as any).picture,
        }
        token.roles = (user as any).roles || []
        token.completionStatus = (user as any).completionStatus || null
        token.company = (user as any).company || null
        if (process.env.NODE_ENV !== "production") {
          console.log("[NextAuth] JWT set from credentials:", {
            user: token.appUser?.email,
            roles: token.roles,
            hasToken: !!token.appToken,
            hasCompany: !!token.company,
          })
        }
      }

      // Handle social login
      if (account && (account.provider === "google" || account.provider === "facebook")) {
        const idToken = (account as any).id_token as string | undefined
        const accessToken = (account as any).access_token as string | undefined
        const providerToken = idToken || accessToken
        if (providerToken) {
          try {
            const data = await exchangeWithBackend({ provider: account.provider as any, token: providerToken })
            token.appToken = data?.token
            token.appUser = data?.user
            token.roles = data?.roles || []
            token.completionStatus = data?.completion_status || null
            token.company = data?.company || null
            if (process.env.NODE_ENV !== "production") {
              console.log("[NextAuth] Social login successful:", data)
            }
            
            // Save authentication data to localStorage for persistence
            if (typeof window !== "undefined") {
              try {
                const authData = {
                  user: data?.user,
                  company: data?.company,
                  roles: data?.roles || [],
                  completionStatus: data?.completion_status || null,
                  token: data?.token,
                }
                localStorage.setItem("adelbaba_auth_data", JSON.stringify(authData))
                
                // Save company data separately if it exists
                if (data?.company) {
                  localStorage.setItem("adelbaba_company_data", JSON.stringify(data.company))
                }
              } catch (error) {
                console.error("Failed to save auth data to localStorage:", error)
              }
            }
          } catch (error) {
            console.error("[NextAuth] Social login failed:", error)
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      ;(session as any).token = (token as any).appToken
      ;(session as any).user = (token as any).appUser || session.user
      ;(session as any).roles = (token as any).roles || []
      ;(session as any).completionStatus = (token as any).completionStatus || null
      ;(session as any).company = (token as any).company || null
      if (process.env.NODE_ENV !== "production") {
        console.log("[NextAuth] Session callback fields:", {
          user: (session as any)?.user?.email,
          roles: (session as any)?.roles,
          hasToken: !!(session as any)?.token,
          hasCompany: !!(session as any)?.company,
        })
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default authOptions


