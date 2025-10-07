"use client"

import type { ReactNode } from "react"
import { I18nProvider } from "@/lib/i18n/context"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileMenuButton } from "@/components/layout/mobile-menu-button"
import { SidebarOverlay } from "@/components/layout/sidebar-overlay"
import { useI18n } from "@/lib/i18n/context"
import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"

function DashboardLayoutContent({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isArabic, language, setLanguage } = useI18n()

  const toggleLanguage = () => setLanguage(language === "en" ? "ar" : "en")
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className={`h-screen bg-background ${isArabic ? "rtl" : "ltr"} flex overflow-y-scroll`} dir={isArabic ? "rtl" : "ltr"}>
      <MobileMenuButton onClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} toggleLanguage={toggleLanguage} />
      <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      <SidebarOverlay isOpen={sidebarOpen} onClose={closeSidebar} />
    </div>
  )
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <AuthGuard>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </AuthGuard>
    </I18nProvider>
  )
}

