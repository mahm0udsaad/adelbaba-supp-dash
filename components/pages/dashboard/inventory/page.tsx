"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { useI18n } from "@/lib/i18n/context"
import { InventoryOperationType, listInventoryLevels, listInventoryHistory, listWarehouses, operateInventory } from "@/src/services/inventory-api"

type LevelRow = any
type HistoryRow = any

export default function InventoryPage() {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<string>("overview")
  const [warehouses, setWarehouses] = useState<Array<{ id: number; name: string }>>([])

  // Overview filters
  const [selectedWarehouses, setSelectedWarehouses] = useState<string>("all")
  const [search, setSearch] = useState<string>("")
  const [levels, setLevels] = useState<{ data: LevelRow[]; meta?: any } | null>(null)
  const [levelsLoading, setLevelsLoading] = useState(false)

  // Movements filters
  const [skuId, setSkuId] = useState<string | undefined>(undefined)
  const [warehouseId, setWarehouseId] = useState<string | undefined>(undefined)
  const [history, setHistory] = useState<{ data: HistoryRow[]; meta?: any } | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)

  // Operate sheet
  const [operateOpen, setOperateOpen] = useState(false)
  const [operateForm, setOperateForm] = useState<{ sku_id?: number; warehouse_id?: number; type: InventoryOperationType; quantity: number; notes?: string; to_warehouse_id?: number }>({ type: "receive", quantity: 1 })
  const [operating, setOperating] = useState(false)

  // Initialize from deep link (e.g., sku_id)
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab) setActiveTab(tab)
    const sku = searchParams.get("sku_id")
    if (sku) setSkuId(sku)
    const wh = searchParams.get("warehouse_id")
    if (wh) setWarehouseId(wh)
  }, [searchParams])

  useEffect(() => {
    listWarehouses().then((res) => setWarehouses(res.data || [])).catch(() => setWarehouses([]))
  }, [])

  const levelsParams = useMemo(() => ({ warehouses: selectedWarehouses === "all" ? undefined : selectedWarehouses, per_page: 15 }), [selectedWarehouses])
  useEffect(() => {
    if (activeTab !== "overview") return
    setLevelsLoading(true)
    listInventoryLevels(levelsParams)
      .then((res) => setLevels(res))
      .finally(() => setLevelsLoading(false))
  }, [activeTab, levelsParams])

  const historyParams = useMemo(() => ({ sku_id: skuId ? Number(skuId) : undefined, warehouse_id: warehouseId ? Number(warehouseId) : undefined, per_page: 15 }), [skuId, warehouseId])
  useEffect(() => {
    if (activeTab !== "movements") return
    setHistoryLoading(true)
    listInventoryHistory(historyParams)
      .then((res) => setHistory(res))
      .finally(() => setHistoryLoading(false))
  }, [activeTab, historyParams])

  const handleOpenOperate = (prefill?: Partial<typeof operateForm>) => {
    setOperateForm((prev) => ({ ...prev, ...prefill }))
    setOperateOpen(true)
  }

  const submitOperate = async () => {
    if (!operateForm.sku_id || !operateForm.warehouse_id || !operateForm.type || !operateForm.quantity) return
    try {
      setOperating(true)
      await operateInventory(operateForm as any)
      setOperateOpen(false)
      // refresh current tab
      if (activeTab === "overview") {
        setLevelsLoading(true)
        listInventoryLevels(levelsParams).then((res) => setLevels(res)).finally(() => setLevelsLoading(false))
      } else if (activeTab === "movements") {
        setHistoryLoading(true)
        listInventoryHistory(historyParams).then((res) => setHistory(res)).finally(() => setHistoryLoading(false))
      }
    } finally {
      setOperating(false)
    }
  }

  const setTab = (tab: string) => {
    setActiveTab(tab)
    const next = new URLSearchParams(searchParams.toString())
    if (tab === "overview") next.delete("tab")
    else next.set("tab", tab)
    router.replace(`/dashboard/inventory?${next.toString()}`)
  }

  return (
    <div className="p-4 space-y-4">
      <Tabs value={activeTab} onValueChange={setTab}>
        <TabsList className="w-full">
          <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
          <TabsTrigger value="warehouses" className="flex-1">Warehouses</TabsTrigger>
          <TabsTrigger value="movements" className="flex-1">Movements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Inventory Levels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Select value={selectedWarehouses} onValueChange={setSelectedWarehouses}>
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
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by SKU or Name" />
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>On Hand</TableHead>
                      <TableHead>Reserved</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(levels?.data || []).filter((row: any) => {
                      const q = search.trim().toLowerCase()
                      if (!q) return true
                      return row?.product?.sku?.toLowerCase().includes(q) || row?.product?.name?.toLowerCase().includes(q)
                    }).map((row: any) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.product?.sku}</TableCell>
                        <TableCell>{row.product?.name}</TableCell>
                        <TableCell>{row.on_hand}</TableCell>
                        <TableCell>{row.reserved}</TableCell>
                        <TableCell>{row.available}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => handleOpenOperate({ sku_id: row.product?.id })}>Operate</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Pagination />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warehouses">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Warehouses</CardTitle>
              <Button size="sm" onClick={() => handleOpenOperate()}>Operate</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {warehouses.map((w) => (
                  <div key={w.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <div className="font-medium">{w.name}</div>
                      <div className="text-sm text-muted-foreground">#{w.id}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Movements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="SKU ID" value={skuId || ""} onChange={(e) => setSkuId(e.target.value || undefined)} />
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
                          <Button size="sm" onClick={() => handleOpenOperate({ sku_id: row.product?.id, warehouse_id: row.warehouse?.id })}>Operate</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Pagination />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Operate Sheet */}
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


