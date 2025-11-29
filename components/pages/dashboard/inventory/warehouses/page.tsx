"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { listWarehouses, createWarehouse, updateWarehouse, deleteWarehouse, Warehouse } from "@/src/services/inventory-api"
import { useI18n } from "@/lib/i18n/context"
import { ScrollArea } from "@/components/ui/scroll-area"

type WarehouseForm = {
  name: string
  address?: string
  region_id?: number
  state_id?: number
  city_id?: number
  code?: string
  manager_name?: string
  manager_email?: string
  manager_phone?: string
  storage_capacity?: number
  is_active?: boolean
}

const initialForm: WarehouseForm = {
  name: "",
  address: "",
  code: "",
  manager_name: "",
  manager_email: "",
  manager_phone: "",
  storage_capacity: 0,
  is_active: true,
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Warehouse | null>(null)
  const [form, setForm] = useState<WarehouseForm>(initialForm)
  const { t } = useI18n()

  const reload = async () => {
    setLoading(true)
    try {
      const res = await listWarehouses()
      setWarehouses(res.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload() }, [])

  const onSubmit = async () => {
    if (!form.name) return
    const body = {
      ...form,
      region_id: form.region_id || 1, // Default or mock
      state_id: form.state_id || 1,   // Default or mock
      city_id: form.city_id || 1,     // Default or mock
    }
    
    try {
      if (editing) {
        await updateWarehouse(editing.id, body)
      } else {
        await createWarehouse(body)
      }
      setOpen(false)
      setEditing(null)
      setForm(initialForm)
      await reload()
    } catch (e) {
      console.error(e)
    }
  }

  const onDelete = async (id: number) => {
    if (!confirm(t.confirmDelete || "Are you sure?")) return
    await deleteWarehouse(id)
    await reload()
  }

  const handleEdit = (w: Warehouse) => {
    setEditing(w)
    setForm({
      name: w.name,
      address: w.address,
      code: w.code,
      manager_name: w.manager_name,
      manager_email: w.manager_email,
      manager_phone: w.manager_phone,
      storage_capacity: w.storage_capacity,
      is_active: w.is_active ?? true,
      region_id: w.region_id,
      state_id: w.state_id,
      city_id: w.city_id,
    })
    setOpen(true)
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t.warehousesTitle}</CardTitle>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setForm(initialForm) } }}>
            <DialogTrigger asChild>
              <Button size="sm">{t.warehouseNewButton}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>
                  {editing ? t.warehouseDialogEditTitle : t.warehouseDialogCreateTitle}
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4 p-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t.warehouseNameLabel}</Label>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.warehouseCodeLabel}</Label>
                      <Input
                        value={form.code || ""}
                        onChange={(e) => setForm({ ...form, code: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.warehouseAddressLabel || "Address"}</Label>
                    <Input
                      value={form.address || ""}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     {/* Placeholder for Region/State/City Selects - using Inputs for now as IDs */}
                    <div className="space-y-2">
                       <Label>Region ID</Label>
                       <Input type="number" value={form.region_id || ""} onChange={e => setForm({...form, region_id: parseInt(e.target.value) || undefined})} />
                    </div>
                     <div className="space-y-2">
                       <Label>City ID</Label>
                       <Input type="number" value={form.city_id || ""} onChange={e => setForm({...form, city_id: parseInt(e.target.value) || undefined})} />
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-medium">Manager Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input value={form.manager_name || ""} onChange={e => setForm({...form, manager_name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={form.manager_email || ""} onChange={e => setForm({...form, manager_email: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input value={form.manager_phone || ""} onChange={e => setForm({...form, manager_phone: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Storage Capacity</Label>
                        <Input type="number" value={form.storage_capacity || ""} onChange={e => setForm({...form, storage_capacity: parseInt(e.target.value) || undefined})} />
                      </div>
                      <div className="flex items-center space-x-2 pt-8">
                        <Switch
                          checked={form.is_active}
                          onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                        />
                        <Label>Is Active</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <div className="flex gap-2 pt-4 border-t">
                <Button className="flex-1" onClick={onSubmit}>
                  {editing ? t.warehouseSaveButton : t.warehouseCreateButton}
                </Button>
                <Button variant="outline" className="bg-transparent" onClick={() => setOpen(false)}>
                  {t.cancel}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.warehouseTableId}</TableHead>
                  <TableHead>{t.warehouseTableName}</TableHead>
                  <TableHead>{t.warehouseTableCode}</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">{t.warehouseTableActions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouses.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell>{w.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{w.name}</div>
                      <div className="text-xs text-muted-foreground">{w.address}</div>
                    </TableCell>
                    <TableCell>{w.code || "-"}</TableCell>
                    <TableCell>
                      <div className="text-sm">{w.manager_name}</div>
                      <div className="text-xs text-muted-foreground">{w.manager_email}</div>
                    </TableCell>
                    <TableCell>{w.storage_capacity}</TableCell>
                    <TableCell>
                      <Switch checked={w.is_active} disabled />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-transparent"
                        onClick={() => handleEdit(w)}
                      >
                        {t.edit}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(w.id)}>
                        {t.delete}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

