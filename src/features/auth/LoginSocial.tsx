"use client"
import { Button } from "@/components/ui/button"
import { signIn, getSession } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getRedirectPath } from "@/src/utils/auth-utils"

export default function LoginSocial() {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)
  const router = useRouter()

  // For OAuth providers, NextAuth will always perform a full redirect
  // through the provider and back. We set callbackUrl to "/" so that
  // our app's root redirect logic can route to onboarding or dashboard.

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    setIsLoading(true)
    setLoadingProvider(provider)
    
    try {
      const result = await signIn(provider)
      
      if (result?.error) {
        console.error(`${provider} login failed:`, result.error)
        toast.error(`${provider} login failed. Please try again.`)
        return
      }
      
      if (result?.ok) {
        // The browser will be navigating to "/" per callbackUrl,
        // where the app will compute the final destination.
        toast.success(`Successfully logged in with ${provider}!`)
      }
    } catch (error) {
      console.error(`${provider} login error:`, error)
      toast.error(`An error occurred during ${provider} login. Please try again.`)
    } finally {
      setIsLoading(false)
      setLoadingProvider(null)
    }
  }

  const onGoogle = () => handleSocialLogin("google")
  const onFacebook = () => handleSocialLogin("facebook")

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Button 
        type="button" 
        variant="outline" 
        className="w-full h-11" 
        onClick={onGoogle}
        disabled={isLoading}
      >
        {loadingProvider === "google" ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            <span>Connecting...</span>
          </div>
        ) : (
          "Google"
        )}
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        className="w-full h-11" 
        onClick={onFacebook}
        disabled={isLoading}
      >
        {loadingProvider === "facebook" ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            <span>Connecting...</span>
          </div>
        ) : (
          "Facebook"
        )}
      </Button>
    </div>
  )
}
