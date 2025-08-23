"use client"

import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

interface MobileMenuButtonProps {
  onClick: () => void
}

export function MobileMenuButton({ onClick }: MobileMenuButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="fixed top-4 left-4 z-50 md:hidden bg-card border shadow-sm"
    >
      <Menu className="h-5 w-5" />
    </Button>
  )
}
