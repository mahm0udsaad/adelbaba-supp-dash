"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Loader2, AlertCircle, Building2 } from "lucide-react"
import { toast } from "sonner"
import { useI18n } from "@/lib/i18n/context"
import { createWarehouse } from "@/src/services/inventory-api"

interface QuickWarehouseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onWarehouseCreated: () => void
}

// Warehouse form type
type WarehouseForm = {
  name: string
  address: string
  code: string
  manager_name: string
  manager_email: string
  manager_phone: string
  storage_capacity: number
  is_active: boolean
}

type FormErrors = {
  name?: string
  code?: string
  storage_capacity?: string
  general?: string
}

// Generate a warehouse code suggestion
const generateWarehouseCode = () => {
  const prefix = "WH"
  const random = Math.floor(100000 + Math.random() * 900000)
  return `${prefix}-${random}`
}

const initialForm: WarehouseForm = {
  name: "",
  address: "",
  code: "",
  manager_name: "",
  manager_email: "",
  manager_phone: "",
  storage_capacity: 1000,
  is_active: true,
}

export function QuickWarehouseModal({ open, onOpenChange, onWarehouseCreated }: QuickWarehouseModalProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<WarehouseForm>(initialForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const { t, formatMessage } = useI18n()

  // Reset form and generate new code when modal opens
  useEffect(() => {
    if (open) {
      setForm({
        ...initialForm,
        code: generateWarehouseCode(),
      })
      setErrors({})
    }
  }, [open])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!form.name.trim()) {
      newErrors.name = "Warehouse name is required"
    }
    
    if (!form.code.trim()) {
      newErrors.code = "Warehouse code is required"
    }
    
    if (!form.storage_capacity || form.storage_capacity < 1) {
      newErrors.storage_capacity = "Storage capacity must be at least 1"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setErrors({})
    
    // Validate form
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await createWarehouse({
        name: form.name,
        address: form.address || undefined,
        code: form.code,
        region_id: 1,
        state_id: 1,
        city_id: 1,
        manager_name: form.manager_name || undefined,
        manager_email: form.manager_email || undefined,
        manager_phone: form.manager_phone || undefined,
        storage_capacity: form.storage_capacity,
        is_active: form.is_active,
      })
      
      toast.success(t.warehouseCreatedTitle || "Warehouse Created", {
        description: formatMessage("warehouseCreatedDescription", { name: form.name }) || `${form.name} has been created successfully`,
      })
      
      // Close modal and refresh warehouses
      onOpenChange(false)
      onWarehouseCreated()
      
    } catch (error: any) {
      console.error("Failed to create warehouse:", error)
      
      // Parse API validation errors
      if (error?.response?.data?.errors) {
        const apiErrors = error.response.data.errors
        const formErrors: FormErrors = {}
        if (apiErrors.name) formErrors.name = apiErrors.name[0]
        if (apiErrors.code) formErrors.code = apiErrors.code[0]
        if (apiErrors.storage_capacity) formErrors.storage_capacity = apiErrors.storage_capacity[0]
        if (Object.keys(formErrors).length > 0) {
          setErrors(formErrors)
        } else {
          setErrors({ general: error.response.data.message || "Failed to create warehouse" })
        }
      } else {
        toast.error(t.error || "Error", {
          description: error?.response?.data?.message || error?.message || t.warehouseCreateError || "Failed to create warehouse",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const updateField = <K extends keyof WarehouseForm>(field: K, value: WarehouseForm[K]) => {
    setForm(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const isFormValid = form.name.trim() && form.code.trim() && form.storage_capacity >= 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>{t.quickWarehouseTitle || "Add New Warehouse"}</DialogTitle>
              <DialogDescription>{t.quickWarehouseDescription || "Create a new warehouse location"}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* General Error Message */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Name and Code */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="warehouse-name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="warehouse-name"
                placeholder="Main Warehouse"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="warehouse-code">
                Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="warehouse-code"
                placeholder="WH-001"
                value={form.code}
                onChange={(e) => updateField("code", e.target.value)}
                className={errors.code ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.code && (
                <p className="text-xs text-red-500">{errors.code}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="warehouse-address">Address</Label>
            <Input
              id="warehouse-address"
              placeholder="123 Warehouse Street, City"
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
            />
          </div>

          <Separator />

          {/* Manager Details */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Manager Details</Label>
            <Input
              placeholder="Manager Name"
              value={form.manager_name}
              onChange={(e) => updateField("manager_name", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="email"
                placeholder="manager@example.com"
                value={form.manager_email}
                onChange={(e) => updateField("manager_email", e.target.value)}
              />
              <Input
                placeholder="+1 234 567 8900"
                value={form.manager_phone}
                onChange={(e) => updateField("manager_phone", e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Storage Capacity and Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="storage-capacity">
                Storage Capacity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="storage-capacity"
                type="number"
                min={1}
                placeholder="10000"
                value={form.storage_capacity}
                onChange={(e) => updateField("storage_capacity", parseInt(e.target.value) || 0)}
                className={errors.storage_capacity ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.storage_capacity && (
                <p className="text-xs text-red-500">{errors.storage_capacity}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center gap-3 h-10">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(checked) => updateField("is_active", checked)}
                />
                <span className="text-sm">{form.is_active ? "Active" : "Inactive"}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t.cancel || "Cancel"}
            </Button>
            <Button type="submit" disabled={loading || !isFormValid}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Creating..." : (t.warehouseCreateButton || "Create Warehouse")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
