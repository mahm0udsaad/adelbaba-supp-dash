"use client"
import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function Page() {
  const { user, isLoading, checkAndApplyRouting } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      // Not authenticated, redirect to login
      router.replace("/login")
    } else {
      // Authenticated, apply conditional routing
      checkAndApplyRouting()
    }
  }, [user, isLoading, checkAndApplyRouting, router])

  // Show loading while determining where to go
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return null
}

