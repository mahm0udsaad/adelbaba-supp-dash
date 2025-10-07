"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { listWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from "@/src/services/inventory-api"

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Array<any>>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<{ name: string; code?: string }>({ name: "" })

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
          <CardTitle>Warehouses</CardTitle>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setForm({ name: "" }) } }}>
            <DialogTrigger asChild>
              <Button size="sm">New Warehouse</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Warehouse" : "Create Warehouse"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input placeholder="Code (optional)" value={form.code || ""} onChange={(e) => setForm({ ...form, code: e.target.value })} />
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={onSubmit}>{editing ? "Save" : "Create"}</Button>
                  <Button variant="outline" className="bg-transparent" onClick={() => setOpen(false)}>Cancel</Button>
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
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouses.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell>{w.id}</TableCell>
                    <TableCell>{w.name}</TableCell>
                    <TableCell>{w.code || "-"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" className="bg-transparent" onClick={() => { setEditing(w); setForm({ name: w.name, code: w.code }); setOpen(true) }}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(w.id)}>Delete</Button>
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


