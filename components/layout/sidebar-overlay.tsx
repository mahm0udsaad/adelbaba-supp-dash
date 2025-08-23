"use client"

interface SidebarOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export function SidebarOverlay({ isOpen, onClose }: SidebarOverlayProps) {
  if (!isOpen) return null

  return <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={onClose} />
}
