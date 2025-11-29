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
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n/context"
import {
  InventoryOperationType,
  listInventoryLevels,
  listInventoryHistory,
  listWarehouses,
  operateInventory,
  listLowStock,
  InventoryLevel,
  InventoryHistoryItem,
  LowStockItem,
  Warehouse
} from "@/src/services/inventory-api"
import { Loader2 } from "lucide-react"

export default function InventoryPage() {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<string>("levels")
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])

  // Overview/Levels filters
  const [selectedWarehouses, setSelectedWarehouses] = useState<string>("all")
  const [search, setSearch] = useState<string>("")
  const [levels, setLevels] = useState<{ data: InventoryLevel[]; meta?: any } | null>(null)
  const [levelsLoading, setLevelsLoading] = useState(false)

  // Low Stock filters
  const [lowStock, setLowStock] = useState<{ data: LowStockItem[]; meta?: any } | null>(null)
  const [lowStockLoading, setLowStockLoading] = useState(false)

  // Movements filters
  const [skuId, setSkuId] = useState<string | undefined>(undefined)
  const [warehouseId, setWarehouseId] = useState<string | undefined>(undefined)
  const [history, setHistory] = useState<{ data: InventoryHistoryItem[]; meta?: any } | null>(null)
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
  
  const fetchLevels = () => {
    setLevelsLoading(true)
    listInventoryLevels(levelsParams)
      .then((res) => setLevels(res))
      .finally(() => setLevelsLoading(false))
  }

  useEffect(() => {
    if (activeTab === "levels") fetchLevels()
  }, [activeTab, levelsParams])

  const fetchLowStock = () => {
    setLowStockLoading(true)
    listLowStock(levelsParams)
      .then((res) => setLowStock(res))
      .finally(() => setLowStockLoading(false))
  }

  useEffect(() => {
    if (activeTab === "low-stock") fetchLowStock()
  }, [activeTab, levelsParams])

  const historyParams = useMemo(() => ({ sku_id: skuId ? Number(skuId) : undefined, warehouse_id: warehouseId ? Number(warehouseId) : undefined, per_page: 15 }), [skuId, warehouseId])
  
  const fetchHistory = () => {
    setHistoryLoading(true)
    listInventoryHistory(historyParams)
      .then((res) => setHistory(res))
      .finally(() => setHistoryLoading(false))
  }

  useEffect(() => {
    if (activeTab === "movements") fetchHistory()
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
      if (activeTab === "levels") fetchLevels()
      else if (activeTab === "low-stock") fetchLowStock()
      else if (activeTab === "movements") fetchHistory()
    } catch (e) {
        console.error(e)
    } finally {
      setOperating(false)
    }
  }

  const setTab = (tab: string) => {
    setActiveTab(tab)
    const next = new URLSearchParams(searchParams.toString())
    if (tab === "levels") next.delete("tab")
    else next.set("tab", tab)
    router.replace(`/dashboard/inventory?${next.toString()}`)
  }

  return (
    <div className="p-4 space-y-4">
      <Tabs value={activeTab} onValueChange={setTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="levels">Inventory Levels</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          <TabsTrigger value="movements">Recent Movements</TabsTrigger>
        </TabsList>

        {/* Levels Tab */}
        <TabsContent value="levels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Inventory Levels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>On Hand</TableHead>
                      <TableHead>Reserved</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Reorder Pt</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {levelsLoading ? (
                        <TableRow><TableCell colSpan={8} className="text-center py-4"><Loader2 className="animate-spin inline mr-2"/>Loading...</TableCell></TableRow>
                    ) : (levels?.data || [])
                      .filter((row) => {
                         const q = search.trim().toLowerCase()
                         if (!q) return true
                         return row?.product?.sku?.toLowerCase().includes(q) || row?.product?.name?.toLowerCase().includes(q)
                      })
                      .map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono">{row.product?.sku}</TableCell>
                        <TableCell>{row.product?.name}</TableCell>
                        <TableCell>{row.on_hand}</TableCell>
                        <TableCell>{row.reserved}</TableCell>
                        <TableCell>{row.available}</TableCell>
                        <TableCell>{row.reorder_point}</TableCell>
                        <TableCell>
                            {row.needs_reorder ? (
                                <Badge variant="destructive">Restock Needed</Badge>
                            ) : (
                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">OK</Badge>
                            )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => handleOpenOperate({ sku_id: row.product?.id })}>Operate</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!levelsLoading && (!levels?.data || levels.data.length === 0) && (
                        <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No inventory levels found.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <Pagination />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Low Stock Tab */}
        <TabsContent value="low-stock" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Low Stock Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Warehouse</TableHead>
                                    <TableHead>Available</TableHead>
                                    <TableHead>Reorder Pt</TableHead>
                                    <TableHead>Restock Needed</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lowStockLoading ? (
                                    <TableRow><TableCell colSpan={7} className="text-center py-4"><Loader2 className="animate-spin inline mr-2"/>Loading...</TableCell></TableRow>
                                ) : (lowStock?.data || []).map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="font-mono">{row.product?.sku}</TableCell>
                                        <TableCell>{row.product?.name}</TableCell>
                                        <TableCell>{row.warehouse?.name}</TableCell>
                                        <TableCell className="text-red-600 font-bold">{row.available}</TableCell>
                                        <TableCell>{row.reorder_point}</TableCell>
                                        <TableCell>{row.restock_quantity_needed}</TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" onClick={() => handleOpenOperate({ sku_id: row.product?.id, warehouse_id: row.warehouse?.id, type: "receive", quantity: row.restock_quantity_needed })}>
                                                Restock
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!lowStockLoading && (!lowStock?.data || lowStock.data.length === 0) && (
                                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No low stock items found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        {/* Movements Tab */}
        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Movements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Reserved Δ</TableHead>
                      <TableHead>On Hand Δ</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Warehouse</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyLoading ? (
                        <TableRow><TableCell colSpan={7} className="text-center py-4"><Loader2 className="animate-spin inline mr-2"/>Loading...</TableCell></TableRow>
                    ) : (history?.data || []).map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="capitalize"><Badge variant="secondary">{row.type}</Badge></TableCell>
                        <TableCell>{row.quantity}</TableCell>
                        <TableCell className={row.reserved_delta > 0 ? "text-blue-600" : ""}>{row.reserved_delta}</TableCell>
                        <TableCell className={row.on_hand_delta > 0 ? "text-green-600" : row.on_hand_delta < 0 ? "text-red-600" : ""}>{row.on_hand_delta}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(row.created_at).toLocaleString()}</TableCell>
                        <TableCell className="text-xs">{row.performedBy?.name}</TableCell>
                        <TableCell className="text-xs">{row.warehouse?.name}</TableCell>
                      </TableRow>
                    ))}
                    {!historyLoading && (!history?.data || history.data.length === 0) && (
                        <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No movements found.</TableCell></TableRow>
                    )}
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
              <div className="space-y-1">
                  <span className="text-xs font-medium">SKU ID</span>
                  <Input type="number" placeholder="SKU ID" value={operateForm.sku_id ?? ""} onChange={(e) => setOperateForm({ ...operateForm, sku_id: Number(e.target.value) })} />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium">Warehouse</span>
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
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-xs font-medium">Type</span>
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
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium">Quantity</span>
                <Input type="number" min={1} value={operateForm.quantity} onChange={(e) => setOperateForm({ ...operateForm, quantity: Number(e.target.value) })} />
              </div>
            </div>
            {operateForm.type === "transfer" ? (
              <div className="space-y-1">
                  <span className="text-xs font-medium">To Warehouse</span>
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
              </div>
            ) : null}
            <div className="space-y-1">
                <span className="text-xs font-medium">Notes</span>
                <Input placeholder="Notes (optional)" value={operateForm.notes || ""} onChange={(e) => setOperateForm({ ...operateForm, notes: e.target.value })} />
            </div>
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


