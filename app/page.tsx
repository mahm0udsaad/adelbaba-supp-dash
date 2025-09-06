"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useAuth } from "@/src/contexts/auth-context"
import { getRedirectPath } from "@/src/utils/auth-utils"

export default function Page() {
  const { data: session, status } = useSession()
  const { authData } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    const user = session?.user || authData.user
    const roles = ((session as any)?.roles as string[]) || authData.roles
    const completionStatus = (session as any)?.completionStatus || authData.completionStatus

    const redirectPath = getRedirectPath(user, roles, completionStatus)
    router.replace(redirectPath)
  }, [session, status, authData, router])

  if (status === "loading") {
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

