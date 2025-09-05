"use client"
import type React from "react"
import { useEffect, useState } from "react"
import apiClient from "@/lib/axios"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { BarChart3, Package, Users, TrendingUp, ShoppingCart, DollarSign, Globe, Truck } from "lucide-react"
import LoginSocial from "@/src/features/auth/LoginSocial"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<null | "google" | "facebook">(null)
  const { socialLogin, login, checkAndApplyRouting } = useAuth()

  const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID as string | undefined

  // If redirected back from server callback with a Google token in query, exchange it
  useEffect(() => {
    if (typeof window === "undefined") return
    const url = new URL(window.location.href)
    const googleToken = url.searchParams.get("g_token")
    if (googleToken) {
      setSocialLoading("google")
      exchangeSocialToken("google", googleToken)
      url.searchParams.delete("g_token")
      window.history.replaceState({}, "", url.toString())
    }
  }, [])

  // Load Facebook SDK if env key is present (Google handled server-side)
  useEffect(() => {
    const loadScript = (src: string, id: string) =>
      new Promise<void>((resolve, reject) => {
        if (document.getElementById(id)) return resolve()
        const s = document.createElement("script")
        s.id = id
        s.src = src
        s.async = true
        s.onload = () => resolve()
        s.onerror = () => reject(new Error(`Failed to load ${src}`))
        document.body.appendChild(s)
      })

    const tasks: Promise<void>[] = []
    // Google handled server-side; no client SDK required
    if (facebookAppId) {
      // Facebook SDK requires a root element
      if (!document.getElementById("fb-root")) {
        const root = document.createElement("div")
        root.id = "fb-root"
        document.body.appendChild(root)
      }
      tasks.push(
        new Promise<void>((resolve) => {
          ;(window as any).fbAsyncInit = function () {
            ;(window as any).FB.init({
              appId: facebookAppId,
              cookie: true,
              xfbml: false,
              version: "v19.0",
            })
            resolve()
          }
          const id = "facebook-jssdk"
          if (document.getElementById(id)) return resolve()
          const js = document.createElement("script")
          js.id = id
          js.src = "https://connect.facebook.net/en_US/sdk.js"
          document.body.appendChild(js)
        })
      )
    }

    if (tasks.length) {
      Promise.allSettled(tasks).catch(() => {})
    }
  }, [facebookAppId])

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!email || !password) return
    
    setLoading(true)
    try {
      await login({ email, password })
      // Use the centralized routing logic
      setTimeout(() => checkAndApplyRouting(), 100)
    } catch (error) {
      console.error("Login failed:", error)
      // You might want to show an error toast here
    } finally {
      setLoading(false)
    }
  }

  async function exchangeSocialToken(provider: "google" | "facebook", token: string) {
    try {
      await socialLogin(provider, token)
      // Use the centralized routing logic
      setTimeout(() => checkAndApplyRouting(), 100)
    } catch (err) {
      console.error("Social login failed", err)
    } finally {
      setSocialLoading(null)
    }
  }

  const handleGoogleLogin = async () => {
    setSocialLoading("google")
    window.location.assign("/api/auth/google/start")
  }

  const handleFacebookLogin = async () => {
    if (!facebookAppId) {
      console.error("Missing NEXT_PUBLIC_FACEBOOK_APP_ID")
      return
    }
    setSocialLoading("facebook")
    try {
      const FB = (window as any).FB
      if (!FB) throw new Error("Facebook SDK not loaded")
      FB.login(
        (response: any) => {
          const accessToken = response?.authResponse?.accessToken
          if (accessToken) {
            exchangeSocialToken("facebook", accessToken)
          } else {
            setSocialLoading(null)
          }
        },
        { scope: "public_profile,email" }
      )
    } catch (e) {
      console.error(e)
      setSocialLoading(null)
    }
  }

  const features = [
    { icon: BarChart3, title: "Analytics Dashboard", description: "Track sales, orders, and performance metrics in real-time" },
    { icon: Package, title: "Inventory Management", description: "Manage your product catalog and stock levels efficiently" },
    { icon: Users, title: "Customer Insights", description: "Understand your buyers with detailed customer analytics" },
    { icon: TrendingUp, title: "Sales Growth", description: "Boost your revenue with our advanced selling tools" },
    { icon: ShoppingCart, title: "Order Management", description: "Process and fulfill orders seamlessly across B2B & B2C" },
    { icon: DollarSign, title: "Financial Reports", description: "Access comprehensive financial reporting and insights" },
    { icon: Globe, title: "Multi-Channel Selling", description: "Expand your reach across multiple marketplaces" },
    { icon: Truck, title: "Logistics Integration", description: "Streamlined shipping and delivery management" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Left Column - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-muted-foreground p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Supplier Dashboard
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Manage your B2B & B2C marketplace presence with powerful tools designed for modern suppliers
            </p>
          </div>

          <div className="grid gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300">
                <div className="bg-white/20 p-2 rounded-lg">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-blue-100 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center space-x-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-blue-200 text-sm">Active Suppliers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">50M+</div>
              <div className="text-blue-200 text-sm">Monthly Orders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">99.9%</div>
              <div className="text-blue-200 text-sm">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex sticky top-12 justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to access your supplier dashboard</p>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl text-center">Sign In</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="supplier@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    <span>Remember me</span>
                  </div>
                  <button className="text-sm text-amber-600 hover:text-amber-700 font-medium bg-transparent border-none cursor-pointer">
                    Forgot password?
                  </button>
                </div>
                <Button
                  className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white font-medium"
                  disabled={loading}
                  onClick={handleSubmit}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">or continue with</span>
                  </div>
                </div>
                <LoginSocial />
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  New supplier? {" "}
                  <button className="text-amber-600 hover:text-amber-700 font-medium bg-transparent border-none cursor-pointer">
                    Register your business
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
