import apiClient from "@/lib/axios"

export type Warehouse = {
  id: number
  name: string
  code?: string
}

export async function listWarehouses(): Promise<{ data: Warehouse[] }> {
  const res = await apiClient.get("/v1/company/warehouses")
  return res.data
}

export async function createWarehouse(body: {
  name: string
  address?: string
  region_id?: number
  state_id?: number
  city_id?: number
  latitude?: string
  longitude?: string
  code?: string
  manager_name?: string
  manager_email?: string
  manager_phone?: string
  storage_capacity?: number
  is_active?: boolean
}): Promise<any> {
  const res = await apiClient.post("/v1/company/warehouses", body)
  return res.data
}

export async function updateWarehouse(id: number | string, body: Partial<Parameters<typeof createWarehouse>[0]>): Promise<any> {
  const res = await apiClient.put(`/v1/company/warehouses/${id}` , body)
  return res.data
}

export async function deleteWarehouse(id: number | string): Promise<any> {
  const res = await apiClient.delete(`/v1/company/warehouses/${id}`)
  return res.data
}

export type InventoryLevel = {
  id: number
  on_hand: number
  reserved: number
  available: number
  reorder_point: number
  restock_level: number
  track_inventory: boolean
}

export async function listInventoryLevels(params?: {
  warehouses?: string // comma-separated ids
  per_page?: number
}): Promise<any> {
  const res = await apiClient.get("/v1/company/inventory/levels", { params })
  return res.data
}

export async function listInventoryHistory(params?: {
  sku_id?: number
  warehouse_id?: number
  per_page?: number
}): Promise<any> {
  const res = await apiClient.get("/v1/company/inventory/history", { params })
  return res.data
}

export type InventoryOperationType =
  | "receive" | "ship" | "reserve" | "release_reservation"
  | "adjust" | "count" | "return" | "damage" | "loss" | "transfer"

export async function operateInventory(body: {
  sku_id: number
  warehouse_id: number
  type: InventoryOperationType
  quantity: number
  notes?: string
  to_warehouse_id?: number // required if type === 'transfer'
}): Promise<{ message: string }> {
  const res = await apiClient.post("/v1/company/inventory/operate", body)
  return res.data
}


