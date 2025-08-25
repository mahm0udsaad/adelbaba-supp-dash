"use client"

import { Button } from "@/components/ui/button"
import { Receipt, Bell, Globe, X } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"

interface SidebarHeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleLanguage: () => void
}

export function SidebarHeader({ sidebarOpen, setSidebarOpen, toggleLanguage }: SidebarHeaderProps) {
  const { t, isArabic } = useI18n()

  return (
    <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
      <div className="flex items-center gap-2 flex-1">
        {/* Logo Container */}
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-sm border border-primary/20">
            <img
              src="/logo-black.webp"
              alt="Adelbaba Logo"
              className="w-8 h-8 object-contain filter brightness-0 invert"
            />
          </div>
        </div>

        {/* Brand Name */}
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground tracking-tight">Adelbaba</h1>
          <p className="text-[10px] text-muted-foreground">Supplier Dashboard</p>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-sidebar-accent" title={t.notifications}>
            <Bell className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="h-8 w-8 p-0 hover:bg-sidebar-accent"
            title={isArabic ? "English" : "العربية"}
          >
            <Globe className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="md:hidden ml-2">
        <X className="h-5 w-5" />
      </Button>
    </div>
  )
}
