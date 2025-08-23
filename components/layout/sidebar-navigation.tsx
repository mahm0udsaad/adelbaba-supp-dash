"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n/context"
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Package,
  Crown,
  BarChart3,
  Users,
  Megaphone,
  Award,
  MessageSquare,
  Settings,
} from "lucide-react"

const sidebarItems = [
  { icon: LayoutDashboard, key: "dashboard" as const, href: "/" },
  { icon: FileText, key: "rfqs" as const, href: "/rfq" },
  { icon: ShoppingCart, key: "orders" as const, href: "/orders" },
  { icon: Package, key: "products" as const, href: "/products" },
  { icon: Crown, key: "membership" as const, href: "/membership" },
  { icon: BarChart3, key: "analytics" as const, href: "/analytics" },
  { icon: Users, key: "crm" as const, href: "/crm" },
  { icon: Megaphone, key: "ads" as const, href: "/ads" },
  { icon: Award, key: "certificates" as const, href: "/certificates" },
  { icon: MessageSquare, key: "inbox" as const, href: "/inbox" },
  { icon: Settings, key: "tools" as const, href: "/tools" },
]

interface SidebarNavigationProps {
  onItemClick: () => void
}

export function SidebarNavigation({ onItemClick }: SidebarNavigationProps) {
  const { t } = useI18n()
  const pathname = usePathname()

  return (
    <nav className="flex-1 overflow-y-auto space-y-1 p-6">
      {sidebarItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
            onClick={onItemClick}
          >
            <Icon className="h-5 w-5" />
            {t[item.key]}
          </Link>
        )
      })}
    </nav>
  )
}
