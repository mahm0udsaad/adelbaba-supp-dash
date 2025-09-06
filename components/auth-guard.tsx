"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useSession } from "next-auth/react"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireOnboarding?: boolean
}

export function AuthGuard({ children, fallback, requireOnboarding = false }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const isMobile = useIsMobile()
  const [redirecting, setRedirecting] = useState(false)

  const user = session?.user
  const roles = ((session as any)?.roles as string[]) || []
  const completionStatus = (session as any)?.completionStatus as any | null

  useEffect(() => {
    if (status === "loading") return

    if (!user) {
      setRedirecting(true)
      router.push("/login")
      return
    }

    if (requireOnboarding) {
      const isOwner = roles.includes("Owner")
      const needsOnboarding = isOwner && (
        !completionStatus?.profile_completed ||
        !completionStatus?.shipping_configured ||
        !completionStatus?.certificates_uploaded
      )
      
      if (needsOnboarding) {
        setRedirecting(true)
        router.push("/onboarding")
        return
      }
    }

    setRedirecting(false)
  }, [user, status, roles, completionStatus, router, requireOnboarding])

  if (status === "loading" || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div 
            className={`animate-spin rounded-full border-b-2 border-primary mx-auto ${
              isMobile ? 'h-6 w-6' : 'h-8 w-8'
            }`}
          ></div>
          <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-base'}`}>
            {redirecting ? 'Redirecting...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return fallback || null
  }

  return <>{children}</>
}
