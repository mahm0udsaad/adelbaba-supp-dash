"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Warehouse as WarehouseIcon, MapPin, User, Mail, Phone, Package, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { createWarehouse, type Warehouse } from "@/src/services/inventory-api"

type WarehouseFormData = {
  name: string
  address: string
  code: string
  manager_name: string
  manager_email: string
  manager_phone: string
  storage_capacity: string
  is_active: boolean
}

type Props = {
  warehouses: Warehouse[]
  onWarehouseAdded: () => void
  onSkip: () => void
  loading?: boolean
}

export default function WarehouseSetupStep({ 
  warehouses, 
  onWarehouseAdded, 
  onSkip,
  loading = false 
}: Props) {
  const [showForm, setShowForm] = useState(warehouses.length === 0)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<WarehouseFormData>({
    name: "",
    address: "",
    code: "",
    manager_name: "",
    manager_email: "",
    manager_phone: "",
    storage_capacity: "",
    is_active: true,
  })

  const handleInputChange = (field: keyof WarehouseFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      toast({ 
        title: "Required field", 
        description: "Warehouse name is required.",
        variant: "destructive" 
      })
      return
    }

    if (!formData.address.trim()) {
      toast({ 
        title: "Required field", 
        description: "Warehouse address is required.",
        variant: "destructive" 
      })
      return
    }

    try {
      setSaving(true)
      await createWarehouse({
        name: formData.name,
        address: formData.address,
        code: formData.code || undefined,
        manager_name: formData.manager_name || undefined,
        manager_email: formData.manager_email || undefined,
        manager_phone: formData.manager_phone || undefined,
        storage_capacity: formData.storage_capacity ? parseFloat(formData.storage_capacity) : undefined,
        is_active: formData.is_active,
      })

      toast({ 
        title: "Success", 
        description: "Warehouse created successfully!" 
      })

      // Reset form
      setFormData({
        name: "",
        address: "",
        code: "",
        manager_name: "",
        manager_email: "",
        manager_phone: "",
        storage_capacity: "",
        is_active: true,
      })
      
      setShowForm(false)
      onWarehouseAdded()
    } catch (error: any) {
      console.error("Failed to create warehouse:", error)
      let description = "Failed to create warehouse. Please try again."
      
      if (error?.response?.data) {
        const data = error.response.data
        if (typeof data === "string") {
          description = data
        } else if (data?.message) {
          description = data.message
        } else if (data?.errors) {
          const firstKey = Object.keys(data.errors)[0]
          const firstMsg = Array.isArray(data.errors[firstKey]) 
            ? data.errors[firstKey][0] 
            : String(data.errors[firstKey])
          description = firstMsg
        }
      }

      toast({ 
        title: "Error", 
        description,
        variant: "destructive" 
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setFormData({
      name: "",
      address: "",
      code: "",
      manager_name: "",
      manager_email: "",
      manager_phone: "",
      storage_capacity: "",
      is_active: true,
    })
  }

  return (
    <div className="space-y-6">
      {/* Existing Warehouses List */}
      {warehouses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Your Warehouses</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowForm(true)}
              disabled={showForm || loading}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Another
            </Button>
          </div>

          <div className="grid gap-4">
            {warehouses.map((warehouse) => (
              <Card key={warehouse.id} className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <WarehouseIcon className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900">{warehouse.name}</h4>
                      {warehouse.code && (
                        <p className="text-sm text-gray-600 mt-1">Code: {warehouse.code}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add New Warehouse Form */}
      {showForm && (
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {warehouses.length === 0 ? "Add Your First Warehouse" : "Add New Warehouse"}
                </h3>
                {warehouses.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                )}
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <WarehouseIcon className="h-4 w-4" />
                      Warehouse Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., Main Warehouse"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      disabled={saving}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="code" className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Warehouse Code
                    </Label>
                    <Input
                      id="code"
                      placeholder="e.g., WRH-001"
                      value={formData.code}
                      onChange={(e) => handleInputChange("code", e.target.value)}
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address *
                  </Label>
                  <Input
                    id="address"
                    placeholder="Full warehouse address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    disabled={saving}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storage_capacity">Storage Capacity (sq ft)</Label>
                  <Input
                    id="storage_capacity"
                    type="number"
                    placeholder="e.g., 100000"
                    value={formData.storage_capacity}
                    onChange={(e) => handleInputChange("storage_capacity", e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Manager Information */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium text-gray-900">Warehouse Manager (Optional)</h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="manager_name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Manager Name
                    </Label>
                    <Input
                      id="manager_name"
                      placeholder="John Doe"
                      value={formData.manager_name}
                      onChange={(e) => handleInputChange("manager_name", e.target.value)}
                      disabled={saving}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="manager_email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Manager Email
                      </Label>
                      <Input
                        id="manager_email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.manager_email}
                        onChange={(e) => handleInputChange("manager_email", e.target.value)}
                        disabled={saving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="manager_phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Manager Phone
                      </Label>
                      <Input
                        id="manager_phone"
                        type="tel"
                        placeholder="+1 234 567 8900"
                        value={formData.manager_phone}
                        onChange={(e) => handleInputChange("manager_phone", e.target.value)}
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2 pt-4 border-t">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange("is_active", checked === true)}
                  disabled={saving}
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Set as active warehouse
                </Label>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={saving || !formData.name.trim() || !formData.address.trim()}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {saving ? "Creating..." : "Create Warehouse"}
                </Button>
                
                {warehouses.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Empty State - First Warehouse */}
      {warehouses.length === 0 && !showForm && (
        <div className="text-center py-12 space-y-4">
          <div className="inline-flex p-4 bg-orange-100 rounded-full">
            <WarehouseIcon className="h-8 w-8 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">No Warehouses Yet</h3>
            <p className="text-gray-600 mt-1">
              Add your first warehouse to start managing inventory
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Warehouse
          </Button>
        </div>
      )}

      {/* Skip Option */}
      {warehouses.length === 0 && !showForm && (
        <div className="text-center pt-4 border-t">
          <p className="text-sm text-gray-600 mb-3">
            You can add warehouses later from your dashboard
          </p>
        </div>
      )}
    </div>
  )
}

