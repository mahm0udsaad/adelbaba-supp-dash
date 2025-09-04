"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import apiClient from "@/lib/axios"

export interface AuthUser {
  id: number
  name: string
  email: string
  picture?: string
  roles?: string[]
}

export interface CompletionStatus {
  profile_completed: boolean
  shipping_configured: boolean
  certificates_uploaded: boolean
  first_product_added: boolean
}

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (params: { email: string; password: string }) => Promise<void>
  socialLogin: (provider: "google" | "facebook", token: string) => Promise<any>
  roles: string[]
  completionStatus: CompletionStatus | null
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [roles, setRoles] = useState<string[]>([])
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus | null>(null)

  // Bootstrap from localStorage token
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    const bootstrap = async () => {
      try {
        if (!token) {
          setUser(null)
          return
        }
        // Optionally verify token by hitting a profile endpoint; for now, decode from storage
        // Replace this with a real `/me` call if available
        // Fallback minimal user to mark as authenticated
        const cachedUser = localStorage.getItem("user")
        if (cachedUser) {
          setUser(JSON.parse(cachedUser))
        } else {
          setUser({ id: 0, name: "", email: "" })
        }
        const cachedRoles = localStorage.getItem("roles")
        if (cachedRoles) setRoles(JSON.parse(cachedRoles))
        const cachedCS = localStorage.getItem("completion_status")
        if (cachedCS) setCompletionStatus(JSON.parse(cachedCS))
      } finally {
        setIsLoading(false)
      }
    }
    bootstrap()
  }, [])

  const login = useCallback(async ({ email, password }: { email: string; password: string }) => {
    setIsLoading(true)
    try {
      const res = await apiClient.post("/api/v1/company/login", { email, password })
      // Expecting { token, user } like the screenshot provided
      const token: string | undefined = res.data?.token
      const apiUser: AuthUser | undefined = res.data?.user
      const apiRoles: string[] | undefined = res.data?.roles
      const apiCS: CompletionStatus | undefined = res.data?.completion_status
      if (token) {
        localStorage.setItem("token", token)
      }
      if (apiUser) {
        localStorage.setItem("user", JSON.stringify(apiUser))
        setUser(apiUser)
      } else {
        // If backend doesn't return user, at least set an email placeholder
        const fallbackUser: AuthUser = { id: 0, name: email, email }
        localStorage.setItem("user", JSON.stringify(fallbackUser))
        setUser(fallbackUser)
      }
      if (apiRoles) {
        localStorage.setItem("roles", JSON.stringify(apiRoles))
        setRoles(apiRoles)
      }
      if (apiCS) {
        localStorage.setItem("completion_status", JSON.stringify(apiCS))
        setCompletionStatus(apiCS)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const socialLogin = useCallback(async (provider: "google" | "facebook", token: string) => {
    setIsLoading(true)
    try {
      const res = await apiClient.post("/api/v1/login/social", { provider, token })
      const data = res.data as any
      const apiToken: string | undefined = data?.token
      const apiUser: AuthUser | undefined = data?.user
      const apiRoles: string[] | undefined = data?.roles
      const apiCS: CompletionStatus | undefined = data?.completion_status
      if (apiToken) localStorage.setItem("token", apiToken)
      if (apiUser) {
        localStorage.setItem("user", JSON.stringify(apiUser))
        setUser(apiUser)
      }
      if (apiRoles) {
        localStorage.setItem("roles", JSON.stringify(apiRoles))
        setRoles(apiRoles)
      }
      if (apiCS) {
        localStorage.setItem("completion_status", JSON.stringify(apiCS))
        setCompletionStatus(apiCS)
      }
      return data
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("roles")
    localStorage.removeItem("completion_status")
    setUser(null)
    setRoles([])
    setCompletionStatus(null)
  }, [])

  const value = useMemo(
    () => ({ user, isLoading, login, socialLogin, roles, completionStatus, logout }),
    [user, isLoading, login, socialLogin, roles, completionStatus, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}


