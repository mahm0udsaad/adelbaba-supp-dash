"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useI18n } from "@/lib/i18n/context"
import { createWarehouse } from "@/src/services/inventory-api"

interface QuickWarehouseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onWarehouseCreated: () => void
}

export function QuickWarehouseModal({ open, onOpenChange, onWarehouseCreated }: QuickWarehouseModalProps) {
  const [loading, setLoading] = useState(false)
  const { t, formatMessage } = useI18n()

  // Form State
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [code, setCode] = useState("")
  const [managerName, setManagerName] = useState("")
  const [managerEmail, setManagerEmail] = useState("")
  const [managerPhone, setManagerPhone] = useState("")

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
      await createWarehouse({
        name,
        address: address || "Default Address", // Provide default if empty to satisfy API if needed
        code: code || `WRH-${Math.floor(Math.random() * 10000)}`, // Generate random code if empty
        region_id: 1,
        state_id: 1,
        city_id: 1,
        manager_name: managerName || "Default Manager",
        manager_email: managerEmail || "manager@example.com",
        manager_phone: managerPhone || "0000000000",
        storage_capacity: 100000,
        is_active: true
      })
      
      toast.success(t.warehouseCreatedTitle, {
        description: formatMessage("warehouseCreatedDescription", { name }),
      })
      
      // Reset form
      setName("")
      setAddress("")
      setCode("")
      setManagerName("")
      setManagerEmail("")
      setManagerPhone("")
      
      // Close modal and refresh warehouses
      onOpenChange(false)
      onWarehouseCreated()
      
    } catch (error: any) {
      console.error("Failed to create warehouse:", error)
      toast.error(t.error, {
        description: error?.response?.data?.message || error?.message || t.warehouseCreateError,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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
            <Label htmlFor="warehouse-address">
              {t.address}
            </Label>
            <Input
              id="warehouse-address"
              placeholder={t.address}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="manager-name">Manager Name</Label>
            <Input
              id="manager-name"
              placeholder="John Doe"
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manager-email">Manager Email</Label>
              <Input
                id="manager-email"
                type="email"
                placeholder="john@doe.com"
                value={managerEmail}
                onChange={(e) => setManagerEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manager-phone">Manager Phone</Label>
              <Input
                id="manager-phone"
                placeholder="0123456789"
                value={managerPhone}
                onChange={(e) => setManagerPhone(e.target.value)}
              />
            </div>
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
