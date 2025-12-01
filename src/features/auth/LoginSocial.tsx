"use client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { toast } from "sonner"

export default function LoginSocial() {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)

  // For OAuth providers, NextAuth performs a full redirect through the provider
  // and back to our app root, where we decide whether to send the user to onboarding or the dashboard.

  const handleSocialLogin = async (provider: "google") => {
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

  return (
    <div className="grid grid-cols-1 gap-3">
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 justify-center border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        onClick={onGoogle}
        disabled={isLoading}
      >
        {loadingProvider === "google" ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            <span>Connecting...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Image src="/icons/google-color.svg" alt="Google" width={20} height={20} priority />
            <span>Continue with Google</span>
          </div>
        )}
      </Button>
    </div>
  )
}
