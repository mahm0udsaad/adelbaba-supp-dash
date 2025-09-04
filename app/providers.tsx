"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { MockDataProvider } from "@/lib/mock-data-context"
import { AuthProvider } from "@/lib/auth-context"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <MockDataProvider>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </MockDataProvider>
    </ThemeProvider>
  )
}

