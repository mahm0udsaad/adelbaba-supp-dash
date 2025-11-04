"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useI18n } from "@/lib/i18n/context"

interface QuickWarehouseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onWarehouseCreated: () => void
}

export function QuickWarehouseModal({ open, onOpenChange, onWarehouseCreated }: QuickWarehouseModalProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const { t, formatMessage } = useI18n()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error(t.error, {
        description: t.warehouseNameRequired,
      })
      return
    }

    setLoading(true)
    try {
      // TODO: Replace with actual API call when warehouse creation API is available
      // const response = await createWarehouse({ name, code, ... })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success(t.warehouseCreatedTitle, {
        description: formatMessage("warehouseCreatedDescription", { name }),
      })
      
      // Reset form
      setName("")
      setCode("")
      
      // Close modal and refresh warehouses
      onOpenChange(false)
      onWarehouseCreated()
      
    } catch (error: any) {
      console.error("Failed to create warehouse:", error)
      toast.error(t.error, {
        description: error?.message || t.warehouseCreateError,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t.quickWarehouseTitle}</DialogTitle>
          <DialogDescription>{t.quickWarehouseDescription}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="warehouse-name">
              {t.warehouseNameLabel} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="warehouse-name"
              placeholder={t.warehouseNamePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="warehouse-code">
              {t.warehouseCodeLabel} <span className="text-muted-foreground text-xs">{t.warehouseCodeOptionalNote}</span>
            </Label>
            <Input
              id="warehouse-code"
              placeholder={t.warehouseCodePlaceholder}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t.warehouseCodeAuto}</p>
          </div>

          <div className="bg-muted/50 p-4 rounded-md space-y-2">
            <p className="text-sm font-medium">{t.note}:</p>
            <p className="text-xs text-muted-foreground">{t.quickWarehouseNote}</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t.cancel}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.warehouseCreateButton}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
