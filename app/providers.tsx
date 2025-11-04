"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { MockDataProvider } from "@/lib/mock-data-context"
import { SessionProvider } from "next-auth/react"
import { AuthProvider } from "@/src/contexts/auth-context"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <MockDataProvider>
        <SessionProvider>
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </SessionProvider>
      </MockDataProvider>
    </ThemeProvider>
  )
}

