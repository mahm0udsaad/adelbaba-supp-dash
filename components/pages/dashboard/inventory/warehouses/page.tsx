"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { listWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from "@/src/services/inventory-api"
import { useI18n } from "@/lib/i18n/context"

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Array<any>>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<{ name: string; code?: string }>({ name: "" })
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
    if (editing) {
      await updateWarehouse(editing.id, form)
    } else {
      await createWarehouse(form as any)
    }
    setOpen(false)
    setEditing(null)
    setForm({ name: "" })
    await reload()
  }

  const onDelete = async (id: number) => {
    await deleteWarehouse(id)
    await reload()
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>{t.warehousesTitle}</CardTitle>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setForm({ name: "" }) } }}>
            <DialogTrigger asChild>
              <Button size="sm">{t.warehouseNewButton}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editing ? t.warehouseDialogEditTitle : t.warehouseDialogCreateTitle}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  placeholder={t.warehouseNameLabel}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <Input
                  placeholder={`${t.warehouseCodeLabel} ${t.warehouseCodeOptionalNote}`}
                  value={form.code || ""}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={onSubmit}>
                    {editing ? t.warehouseSaveButton : t.warehouseCreateButton}
                  </Button>
                  <Button variant="outline" className="bg-transparent" onClick={() => setOpen(false)}>
                    {t.cancel}
                  </Button>
                </div>
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
                  <TableHead className="text-right">{t.warehouseTableActions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouses.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell>{w.id}</TableCell>
                    <TableCell>{w.name}</TableCell>
                    <TableCell>{w.code || "-"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-transparent"
                        onClick={() => {
                          setEditing(w)
                          setForm({ name: w.name, code: w.code })
                          setOpen(true)
                        }}
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

