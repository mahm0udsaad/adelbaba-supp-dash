"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Globe, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [language, setLanguage] = useState<"en" | "ar">("en")
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "supplier@adelbaba.com", // Pre-filled for demo
    password: "password123", // Pre-filled for demo
  })

  const { login } = useAuth()
  const router = useRouter()

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ar" : "en"))
    // Store language preference
    localStorage.setItem("language", language === "en" ? "ar" : "en")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log("[v0] Starting login process...")
      await login(formData.email, formData.password)
      console.log("[v0] Login successful, redirecting to dashboard...")
      toast({
        title: isArabic ? "تم تسجيل الدخول بنجاح" : "Login successful",
        description: isArabic ? "مرحباً بك في لوحة التحكم" : "Welcome to your dashboard",
      })
      router.push("/")
    } catch (error: any) {
      console.log("[v0] Login failed:", error)
      toast({
        title: isArabic ? "خطأ في تسجيل الدخول" : "Login failed",
        description: error.response?.data?.error?.message || (isArabic ? "بيانات غير صحيحة" : "Invalid credentials"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isArabic = language === "ar"

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">A</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{isArabic ? "عادل بابا" : "Adelbaba"}</h1>
              <p className="text-sm text-muted-foreground">{isArabic ? "لوحة تحكم الموردين" : "Supplier Dashboard"}</p>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={toggleLanguage} className="mb-4 bg-transparent">
            <Globe className="w-4 h-4 mr-2" />
            {isArabic ? "English" : "العربية"}
          </Button>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "تسجيل الدخول" : "Sign In"}</CardTitle>
            <CardDescription>
              {isArabic ? "أدخل بياناتك للوصول إلى لوحة التحكم" : "Enter your credentials to access your dashboard"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{isArabic ? "البريد الإلكتروني" : "Email"}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={isArabic ? "أدخل بريدك الإلكتروني" : "Enter your email"}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{isArabic ? "كلمة المرور" : "Password"}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isArabic ? "أدخل كلمة المرور" : "Enter your password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button className="w-full" size="lg" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isArabic ? "جاري تسجيل الدخول..." : "Signing in..."}
                  </>
                ) : isArabic ? (
                  "تسجيل الدخول"
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="text-center">
                <Button variant="link" size="sm" type="button" disabled={isLoading}>
                  {isArabic ? "نسيت كلمة المرور؟" : "Forgot password?"}
                </Button>
              </div>
            </form>

            {/* Demo Credentials */}
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">{isArabic ? "بيانات تجريبية:" : "Demo credentials:"}</p>
              <p className="text-xs font-mono">supplier@adelbaba.com</p>
              <p className="text-xs font-mono">password123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
