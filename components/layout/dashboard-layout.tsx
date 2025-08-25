"use client"

import { useState } from "react"
import { Outlet } from "react-router-dom"
import { useI18n, I18nProvider } from "@/lib/i18n/context"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileMenuButton } from "@/components/layout/mobile-menu-button"
import { SidebarOverlay } from "@/components/layout/sidebar-overlay"
import "@/styles/globals.css"

function DashboardLayoutContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { language, setLanguage, isArabic } = useI18n()

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en")
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div
      className={`h-screen bg-background ${isArabic ? "rtl" : "ltr"} flex overflow-hidden`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <MobileMenuButton onClick={() => setSidebarOpen(!sidebarOpen)} />

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} toggleLanguage={toggleLanguage} />

      <main className="flex-1 overflow-y-auto bg-background">
        <Outlet />
      </main>

      <SidebarOverlay isOpen={sidebarOpen} onClose={closeSidebar} />
    </div>
  )
}

export default function DashboardLayout() {
  return (
    <I18nProvider>
      <DashboardLayoutContent />
    </I18nProvider>
  )
}


