"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { InventoryOperationType, listInventoryHistory, listWarehouses, operateInventory } from "@/src/services/inventory-api"

export default function MovementsPage() {
  const [warehouses, setWarehouses] = useState<Array<{ id: number; name: string }>>([])
  const [skuId, setSkuId] = useState<string>("")
  const [warehouseId, setWarehouseId] = useState<string | undefined>(undefined)
  const [history, setHistory] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Operate
  const [operateOpen, setOperateOpen] = useState(false)
  const [operateForm, setOperateForm] = useState<{ sku_id?: number; warehouse_id?: number; type: InventoryOperationType; quantity: number; notes?: string; to_warehouse_id?: number }>({ type: "receive", quantity: 1 })
  const [operating, setOperating] = useState(false)

  useEffect(() => { listWarehouses().then((r) => setWarehouses(r.data || [])) }, [])

  const params = useMemo(() => ({ sku_id: skuId ? Number(skuId) : undefined, warehouse_id: warehouseId ? Number(warehouseId) : undefined, per_page: 15 }), [skuId, warehouseId])
  useEffect(() => {
    setLoading(true)
    listInventoryHistory(params).then((r) => setHistory(r)).finally(() => setLoading(false))
  }, [params])

  const openOperate = (prefill?: Partial<typeof operateForm>) => {
    setOperateForm((prev) => ({ ...prev, ...prefill }))
    setOperateOpen(true)
  }

  const submitOperate = async () => {
    if (!operateForm.sku_id || !operateForm.warehouse_id) return
    try {
      setOperating(true)
      await operateInventory(operateForm as any)
      setOperateOpen(false)
      setLoading(true)
      listInventoryHistory(params).then((r) => setHistory(r)).finally(() => setLoading(false))
    } finally {
      setOperating(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Inventory Movements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="SKU ID" value={skuId} onChange={(e) => setSkuId(e.target.value)} />
            <Select value={warehouseId ?? "all"} onValueChange={(v) => setWarehouseId(v === "all" ? undefined : v)}>
              <SelectTrigger>
                <SelectValue placeholder="All Warehouses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Reserved Δ</TableHead>
                  <TableHead>On Hand Δ</TableHead>
                  <TableHead>At</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(history?.data || []).map((row: any) => (
                  <TableRow key={row.id}>
                    <TableCell className="capitalize">{row.type}</TableCell>
                    <TableCell>{row.quantity}</TableCell>
                    <TableCell>{row.reserved_delta}</TableCell>
                    <TableCell>{row.on_hand_delta}</TableCell>
                    <TableCell>{row.created_at}</TableCell>
                    <TableCell>{row.warehouse?.name}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => openOperate({ sku_id: row.product?.id, warehouse_id: row.warehouse?.id })}>Operate</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Pagination />
        </CardContent>
      </Card>

      <Sheet open={operateOpen} onOpenChange={setOperateOpen}>
        <SheetContent side="bottom" className="max-w-full">
          <SheetHeader>
            <SheetTitle>Inventory Operation</SheetTitle>
          </SheetHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder="SKU ID" value={operateForm.sku_id ?? ""} onChange={(e) => setOperateForm({ ...operateForm, sku_id: Number(e.target.value) })} />
              <Select value={operateForm.warehouse_id ? String(operateForm.warehouse_id) : ""} onValueChange={(v) => setOperateForm({ ...operateForm, warehouse_id: Number(v) })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((w) => (
                    <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={operateForm.type} onValueChange={(v) => setOperateForm({ ...operateForm, type: v as InventoryOperationType })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["receive","ship","reserve","release_reservation","adjust","count","return","damage","loss","transfer"] as InventoryOperationType[]).map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="number" min={1} value={operateForm.quantity} onChange={(e) => setOperateForm({ ...operateForm, quantity: Number(e.target.value) })} />
            </div>
            {operateForm.type === "transfer" ? (
              <Select value={operateForm.to_warehouse_id ? String(operateForm.to_warehouse_id) : ""} onValueChange={(v) => setOperateForm({ ...operateForm, to_warehouse_id: Number(v) })}>
                <SelectTrigger>
                  <SelectValue placeholder="To Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((w) => (
                    <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
            <Input placeholder="Notes (optional)" value={operateForm.notes || ""} onChange={(e) => setOperateForm({ ...operateForm, notes: e.target.value })} />
            <Separator />
            <div className="flex gap-2">
              <Button className="flex-1" onClick={submitOperate} disabled={operating}>{operating ? "Processing..." : "Submit"}</Button>
              <Button variant="outline" className="bg-transparent" onClick={() => setOperateOpen(false)}>Cancel</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}


