"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import apiClient from "./axios"

interface User {
  id: string
  email: string
  name: string
  company: string
  membershipTier: "basic" | "gold"
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing auth on mount
  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("user_data")

    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error("Failed to parse user data:", error)
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log("[v0] Starting login process...")
      const response = await apiClient.post("/api/v1/auth/login", {
        email,
        password,
      })

      const { token, user: userData } = response.data

      localStorage.setItem("auth_token", token)
      localStorage.setItem("user_data", JSON.stringify(userData))
      setUser(userData)
      console.log("[v0] Login successful, user set:", userData)
    } catch (error) {
      console.log("[v0] Login failed:", error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    setUser(null)
    window.location.href = "/login"
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem("user_data", JSON.stringify(updatedUser))
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
