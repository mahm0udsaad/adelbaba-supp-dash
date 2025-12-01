"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/src/contexts/auth-context"
import { getRedirectPath } from "@/src/utils/auth-utils"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BarChart3, Package, Users, TrendingUp, ShoppingCart, DollarSign, Globe, Truck } from "lucide-react"
import LoginSocial from "@/src/features/auth/LoginSocial"
import Link from "next/link"

type FieldErrors = Record<string, string[]>

type FormErrorState = {
  message: string
  fieldErrors?: FieldErrors
}

const DEFAULT_ERROR_MESSAGE =
  "We couldn't sign you in. Please check your credentials and try again."

const SUPPLIER_REQUIRED_ERROR = "supplier_required"
const SUPPLIER_REGISTRATION_URL = "https://adil-baba.com/en/sell/start-selling"

const parseAuthError = (error: unknown): FormErrorState => {
  let rawMessage = ""

  if (typeof error === "string") {
    rawMessage = error
  } else if (error instanceof Error) {
    rawMessage = error.message
  } else if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    rawMessage = (error as { message: string }).message
  }

  rawMessage = rawMessage.trim()
  const sanitizedMessage = rawMessage.replace(/^Backend login failed:\s*\d+\s*/i, "").trim()

  let structured: { message?: string; errors?: Record<string, unknown> } | null = null
  if (sanitizedMessage.startsWith("{")) {
    try {
      structured = JSON.parse(sanitizedMessage)
    } catch {
      structured = null
    }
  } else {
    const jsonStart = sanitizedMessage.indexOf("{")
    if (jsonStart !== -1) {
      const possibleJson = sanitizedMessage.slice(jsonStart)
      try {
        structured = JSON.parse(possibleJson)
      } catch {
        structured = null
      }
    }
  }

  let message =
    structured?.message ||
    (sanitizedMessage && !sanitizedMessage.startsWith("{") ? sanitizedMessage : "")

  if (!message || message === "CredentialsSignin") {
    message = DEFAULT_ERROR_MESSAGE
  }

  let fieldErrors: FieldErrors | undefined
  if (structured?.errors && typeof structured.errors === "object") {
    const entries = Object.entries(structured.errors).reduce<FieldErrors>((acc, [key, value]) => {
      if (Array.isArray(value)) {
        acc[key] = value.map((item) => String(item))
      } else if (typeof value === "string") {
        acc[key] = [value]
      }
      return acc
    }, {})

    fieldErrors = Object.keys(entries).length > 0 ? entries : undefined
  }

  return {
    message,
    fieldErrors,
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<FormErrorState | null>(null)
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false)
  const router = useRouter()
  const { authData } = useAuth()
  const searchParams = useSearchParams()
  const errorParam = searchParams?.get("error")

  useEffect(() => {
    setIsSupplierModalOpen(errorParam === SUPPLIER_REQUIRED_ERROR)
  }, [errorParam])

  const clearErrorQuery = () => {
    if (!searchParams) return
    const params = new URLSearchParams(searchParams.toString())
    params.delete("error")
    const query = params.toString()
    router.replace(query ? `/login?${query}` : "/login")
  }

  const handleSupplierModalChange = (open: boolean) => {
    if (!open) {
      clearErrorQuery()
    }
    setIsSupplierModalOpen(open)
  }

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    const missingEmail = !email.trim()
    const missingPassword = !password.trim()

    if (missingEmail || missingPassword) {
      const fieldErrors: FieldErrors = {}
      if (missingEmail) {
        fieldErrors.email = ["Email is required."]
      }
      if (missingPassword) {
        fieldErrors.password = ["Password is required."]
      }

      const message = missingEmail && missingPassword
        ? "Please enter your email and password."
        : missingEmail
        ? "Please enter your email address."
        : "Please enter your password."

      setFormError({
        message,
        fieldErrors,
      })
      return
    }

    setLoading(true)
    setFormError(null)
    try {
      const result = await signIn("credentials", { redirect: false, email, password })
      if (result?.error) {
        throw new Error(result.error)
      }
      // Decide destination based on session data
      const session = await getSession()
      const user = session?.user || authData.user
      const roles = ((session as any)?.roles as string[]) || authData.roles
      const completionStatus = (session as any)?.completionStatus || authData.completionStatus

      const redirectPath = getRedirectPath(user, roles, completionStatus)
      router.replace(redirectPath)
    } catch (error: any) {
      console.error("Login failed:", error)
      const parsedError = parseAuthError(error)
      setFormError(parsedError)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: BarChart3, title: "Analytics Dashboard", description: "Track sales, orders, and performance metrics in real-time" },
    { icon: Package, title: "Inventory Management",  description: "Manage your product catalog and stock levels efficiently" },
    { icon: TrendingUp, title: "Sales Growth",       description: "Boost your revenue with our advanced selling tools" },
    { icon: ShoppingCart, title: "Order Management", description: "Process and fulfill orders seamlessly across B2B & B2C" },
    { icon: DollarSign, title: "Financial Reports",  description: "Access comprehensive financial reporting and insights" },
    { icon: Truck, title: "Logistics Integration",   description: "Streamlined shipping and delivery management" }
  ]

  const emailErrors = formError?.fieldErrors?.email ?? []
  const passwordErrors = formError?.fieldErrors?.password ?? []
  const additionalErrors = formError?.fieldErrors
    ? Object.entries(formError.fieldErrors).filter(
        ([key]) => key !== "email" && key !== "password"
      )
    : []

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
              {formError && (
                <Alert
                  variant="destructive"
                  className="mb-6 border-destructive/40 bg-destructive/10 text-destructive"
                >
                  <AlertTitle>Unable to sign in</AlertTitle>
                  <AlertDescription>
                    <p>{formError.message}</p>
                    {additionalErrors.length > 0 && (
                      <ul className="mt-2 space-y-1 text-sm">
                        {additionalErrors.flatMap(([, errors]) => errors).map((msg, index) => (
                          <li key={`form-error-${index}`}>{msg}</li>
                        ))}
                      </ul>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="supplier@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (formError) setFormError(null)
                    }}
                    className={cn(
                      "h-11",
                      emailErrors.length > 0 && "border-destructive focus-visible:ring-destructive"
                    )}
                    aria-invalid={emailErrors.length > 0 ? "true" : undefined}
                    aria-describedby={emailErrors.length > 0 ? "email-error" : undefined}
                  />
                  {emailErrors.length > 0 && (
                    <div id="email-error" className="text-sm text-destructive leading-tight">
                      {emailErrors.map((errorMessage, index) => (
                        <p key={`email-error-${index}`}>{errorMessage}</p>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (formError) setFormError(null)
                    }}
                    className={cn(
                      "h-11",
                      passwordErrors.length > 0 && "border-destructive focus-visible:ring-destructive"
                    )}
                    aria-invalid={passwordErrors.length > 0 ? "true" : undefined}
                    aria-describedby={passwordErrors.length > 0 ? "password-error" : undefined}
                  />
                  {passwordErrors.length > 0 && (
                    <div id="password-error" className="text-sm text-destructive leading-tight">
                      {passwordErrors.map((errorMessage, index) => (
                        <p key={`password-error-${index}`}>{errorMessage}</p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    <span>Remember me</span>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium bg-transparent border-none cursor-pointer"
                  >
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
                <LoginSocial />
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  New supplier? {" "}
                  <Link href={SUPPLIER_REGISTRATION_URL} className="text-amber-600 hover:text-amber-700 font-medium bg-transparent border-none cursor-pointer" target="_blank" rel="noopener noreferrer">
                    Register your business
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isSupplierModalOpen} onOpenChange={handleSupplierModalChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Complete your supplier registration</DialogTitle>
            <DialogDescription>
              We couldn't find an active supplier account associated with your Google email. Please register as a supplier to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" onClick={() => handleSupplierModalChange(false)} className="flex-1">
              Back to login
            </Button>
            <Button asChild className="flex-1 bg-amber-600 hover:bg-amber-700 text-white">
              <Link href={SUPPLIER_REGISTRATION_URL} target="_blank" rel="noopener noreferrer">
                Register now
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
