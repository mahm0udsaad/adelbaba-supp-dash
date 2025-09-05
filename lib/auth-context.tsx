"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import apiClient from "@/lib/axios"
import { getSession } from "next-auth/react"

export interface AuthUser {
  id: number
  name: string
  email: string
  picture?: string
  roles?: string[]
  phone?: string
  company_name?: string
  unread_notifications_count?: number
}

export interface CompletionStatus {
  profile_completed: boolean
  shipping_configured: boolean
  certificates_uploaded: boolean
  first_product_added: boolean
}

export interface CompanyProfile {
  id?: number
  name?: string
  logo?: string
  founded_year?: number
  description?: string
  location?: string
  region_id?: number
  state_id?: number
  city_id?: number
  contacts?: Array<{
    id?: number
    phone: string
    email: string
    is_primary: number
  }>
}

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (params: { email: string; password: string }) => Promise<void>
  socialLogin: (provider: "google" | "facebook", token: string) => Promise<any>
  roles: string[]
  completionStatus: CompletionStatus | null
  profile: CompanyProfile | null
  logout: () => void
  fetchProfile: () => Promise<CompanyProfile | null>
  updateProfile: (formData: FormData) => Promise<void>
  updateCompletionStatus: (updates: Partial<CompletionStatus>) => void
  checkAndApplyRouting: () => void
  softLogout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [roles, setRoles] = useState<string[]>([])
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus | null>(null)
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const router = useRouter()

  // Bootstrap from localStorage token or NextAuth session with conditional routing
  useEffect(() => {
    const bootstrap = async () => {
      try {
        setIsLoading(true)
        
        // Try to get session from NextAuth first
        const session = await getSession().catch(() => null)
        const sessionToken = (session as any)?.token as string | undefined
        const sessionUser = (session as any)?.user as AuthUser | undefined
        const sessionRoles = ((session as any)?.roles as string[] | undefined) || []
        const sessionCS = (session as any)?.completionStatus as CompletionStatus | null

        if (sessionToken && sessionUser) {
          // Store session data
          localStorage.setItem("token", sessionToken)
          localStorage.setItem("user", JSON.stringify(sessionUser))
          localStorage.setItem("roles", JSON.stringify(sessionRoles))
          if (sessionCS) {
            localStorage.setItem("completion_status", JSON.stringify(sessionCS))
          }
          
          // Set state
          setUser(sessionUser)
          setRoles(sessionRoles)
          setCompletionStatus(sessionCS)
          
          // Set bearer token on API client
          apiClient.defaults.headers.Authorization = `Bearer ${sessionToken}`
          
          return
        }

        // Fallback to localStorage token
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        if (token) {
          // Set bearer token on API client
          apiClient.defaults.headers.Authorization = `Bearer ${token}`
          
          // Load cached data
          const cachedUser = localStorage.getItem("user")
          const cachedRoles = localStorage.getItem("roles")
          const cachedCS = localStorage.getItem("completion_status")
          const cachedProfile = localStorage.getItem("profile")
          
          if (cachedUser) setUser(JSON.parse(cachedUser))
          if (cachedRoles) setRoles(JSON.parse(cachedRoles))
          if (cachedCS) setCompletionStatus(JSON.parse(cachedCS))
          if (cachedProfile) setProfile(JSON.parse(cachedProfile))
        } else {
          // No authentication
          setUser(null)
          setRoles([])
          setCompletionStatus(null)
          setProfile(null)
        }
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
        apiClient.defaults.headers.Authorization = `Bearer ${token}`
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
      
      if (apiToken) {
        localStorage.setItem("token", apiToken)
        apiClient.defaults.headers.Authorization = `Bearer ${apiToken}`
      }
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

  // Conditional routing logic
  const checkAndApplyRouting = useCallback(() => {
    if (!user || isLoading) return

    const isOwner = roles.includes("Owner")
    const shippingNotConfigured = !completionStatus?.shipping_configured
    const certificatesNotUploaded = !completionStatus?.certificates_uploaded

    if (isOwner && shippingNotConfigured && certificatesNotUploaded) {
      router.replace("/onboarding")
    } else {
      router.replace("/dashboard")
    }
  }, [user, roles, completionStatus, isLoading, router])

  // Fetch company profile
  const fetchProfile = useCallback(async (): Promise<CompanyProfile | null> => {
    try {
      const res = await apiClient.get("/api/v1/profile")
      const profileData = res.data as CompanyProfile
      
      // Cache the profile data
      localStorage.setItem("profile", JSON.stringify(profileData))
      setProfile(profileData)
      
      return profileData
    } catch (error) {
      console.error("Failed to fetch profile:", error)
      return null
    }
  }, [])

  // Update company profile
  const updateProfile = useCallback(async (formData: FormData) => {
    try {
      const res = await apiClient.post("/api/v1/company/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      
      // Refetch profile after successful update
      await fetchProfile()
      
      return res.data
    } catch (error) {
      console.error("Failed to update profile:", error)
      throw error
    }
  }, [fetchProfile])

  // Update completion status
  const updateCompletionStatus = useCallback((updates: Partial<CompletionStatus>) => {
    setCompletionStatus(prev => {
      const newStatus = { ...prev, ...updates } as CompletionStatus
      localStorage.setItem("completion_status", JSON.stringify(newStatus))
      return newStatus
    })
  }, [])

  // Soft logout for session expiry - doesn't navigate, just clears state
  const softLogout = useCallback(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("roles")
    localStorage.removeItem("completion_status")
    localStorage.removeItem("profile")
    setUser(null)
    setRoles([])
    setCompletionStatus(null)
    setProfile(null)
    delete apiClient.defaults.headers.Authorization
  }, [])

  // Full logout with navigation
  const logout = useCallback(() => {
    softLogout()
    router.push("/login")
  }, [softLogout, router])

  const value = useMemo(
    () => ({ 
      user, 
      isLoading, 
      login, 
      socialLogin, 
      roles, 
      completionStatus, 
      profile,
      logout,
      softLogout,
      fetchProfile,
      updateProfile,
      updateCompletionStatus,
      checkAndApplyRouting
    }),
    [user, isLoading, login, socialLogin, roles, completionStatus, profile, logout, softLogout, fetchProfile, updateProfile, updateCompletionStatus, checkAndApplyRouting]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}

