"use client"
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"

export default function LoginSocial() {
  const onGoogle = () => signIn("google", { callbackUrl: "/" })
  const onFacebook = () => signIn("facebook", { callbackUrl: "/" })
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Button type="button" variant="outline" className="w-full h-11" onClick={onGoogle}>
        Google
      </Button>
      <Button type="button" variant="outline" className="w-full h-11" onClick={onFacebook}>
        Facebook
      </Button>
    </div>
  )
}


