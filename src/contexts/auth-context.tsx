"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useSession } from "next-auth/react"
import apiClient from "@/lib/axios"

// Types for the authentication data
export interface User {
  id: number
  name: string
  picture: string
  email: string
  phone: string
  has_company: boolean
  unread_notifications_count: number
}

export interface Company {
  id: number
  name: string
  description: string
  founded_year: number
  is_active: boolean
  verified_at: string | null
  location: string
  logo: string
  owner: User
  contacts: Array<{
    id: number
    phone: string
    email: string
    is_primary: number
    created_at: string
    updated_at: string
  }>
  city: {
    id: number
    name: string
  }
  region: {
    id: number
    name: string
    picture: string
  }
  state: {
    id: number
    name: string
  }
  supplier: {
    id: number
    name: string
    location: string
    logo: string
    on_time_delivery_rate: string
    rating: string
    status: string
  }
}

export interface CompletionStatus {
  profile_completed: boolean
  shipping_configured: boolean
  certificates_uploaded: boolean
  first_product_added: boolean
}

export interface AuthData {
  user: User | null
  company: Company | null
  roles: string[]
  completionStatus: CompletionStatus | null
  token: string | null
}

interface AuthContextType {
  authData: AuthData
  isLoading: boolean
  error: string | null
  updateAuthData: (data: Partial<AuthData>) => void
  clearAuthData: () => void
  fetchCompanyData: () => Promise<void>
  refreshAuthData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// localStorage keys
const AUTH_DATA_KEY = "adelbaba_auth_data"
const COMPANY_DATA_KEY = "adelbaba_company_data"

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [authData, setAuthData] = useState<AuthData>({
    user: null,
    company: null,
    roles: [],
    completionStatus: null,
    token: null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load data from localStorage on mount
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const storedAuthData = localStorage.getItem(AUTH_DATA_KEY)
        const storedCompanyData = localStorage.getItem(COMPANY_DATA_KEY)
        
        if (storedAuthData) {
          const parsedAuthData = JSON.parse(storedAuthData)
          setAuthData(prev => ({
            ...prev,
            ...parsedAuthData,
            // Don't restore token from localStorage for security
            token: null,
          }))
        }
        
        if (storedCompanyData) {
          const parsedCompanyData = JSON.parse(storedCompanyData)
          setAuthData(prev => ({
            ...prev,
            company: parsedCompanyData,
          }))
        }
      } catch (error) {
        console.error("Failed to load auth data from localStorage:", error)
        // Clear corrupted data
        localStorage.removeItem(AUTH_DATA_KEY)
        localStorage.removeItem(COMPANY_DATA_KEY)
      }
    }

    loadFromStorage()
  }, [])

  // Update auth data when session changes
  useEffect(() => {
    if (status === "loading") return

    if (session) {
      const sessionData = session as any
      const newAuthData: AuthData = {
        user: sessionData.user || null,
        company: sessionData.company || null,
        roles: sessionData.roles || [],
        completionStatus: sessionData.completionStatus || null,
        token: sessionData.token || null,
      }

      setAuthData(newAuthData)
      
      // Save to localStorage (excluding token for security)
      try {
        const dataToStore = {
          ...newAuthData,
          token: null, // Don't store token in localStorage
        }
        localStorage.setItem(AUTH_DATA_KEY, JSON.stringify(dataToStore))
      } catch (error) {
        console.error("Failed to save auth data to localStorage:", error)
      }
    } else {
      // Clear data when session is null
      setAuthData({
        user: null,
        company: null,
        roles: [],
        completionStatus: null,
        token: null,
      })
      localStorage.removeItem(AUTH_DATA_KEY)
      localStorage.removeItem(COMPANY_DATA_KEY)
    }
  }, [session, status])

  const updateAuthData = (data: Partial<AuthData>) => {
    setAuthData(prev => {
      const newData = { ...prev, ...data }
      
      // Save to localStorage (excluding token)
      try {
        const dataToStore = {
          ...newData,
          token: null,
        }
        localStorage.setItem(AUTH_DATA_KEY, JSON.stringify(dataToStore))
        
        // Save company data separately if it exists
        if (newData.company) {
          localStorage.setItem(COMPANY_DATA_KEY, JSON.stringify(newData.company))
        }
      } catch (error) {
        console.error("Failed to save auth data to localStorage:", error)
      }
      
      return newData
    })
  }

  const clearAuthData = () => {
    setAuthData({
      user: null,
      company: null,
      roles: [],
      completionStatus: null,
      token: null,
    })
    localStorage.removeItem(AUTH_DATA_KEY)
    localStorage.removeItem(COMPANY_DATA_KEY)
  }

  const fetchCompanyData = async () => {
    if (!authData.token) {
      setError("No authentication token available")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.get("/v1/company")
      const companyData = response.data.data as Company
      
      updateAuthData({ company: companyData })
      
      // Save company data to localStorage
      localStorage.setItem(COMPANY_DATA_KEY, JSON.stringify(companyData))
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch company data"
      setError(errorMessage)
      console.error("Failed to fetch company data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshAuthData = async () => {
    if (!authData.token) {
      setError("No authentication token available")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch fresh company data
      await fetchCompanyData()
      
      // You could also fetch other user data here if needed
      // For now, we'll rely on the session data
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to refresh auth data"
      setError(errorMessage)
      console.error("Failed to refresh auth data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    authData,
    isLoading,
    error,
    updateAuthData,
    clearAuthData,
    fetchCompanyData,
    refreshAuthData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Hook to get company data specifically
export function useCompany(): { company: Company | null; isLoading: boolean; error: string | null } {
  const { authData, isLoading, error } = useAuth()
  return {
    company: authData.company,
    isLoading,
    error,
  }
}

// Hook to get user data specifically
export function useUser(): { user: User | null; isLoading: boolean; error: string | null } {
  const { authData, isLoading, error } = useAuth()
  return {
    user: authData.user,
    isLoading,
    error,
  }
}
