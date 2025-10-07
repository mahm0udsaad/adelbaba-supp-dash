import apiClient from "@/lib/axios"

export interface ShippoCarrier {
  carrier: string
  object_id: string
  object_owner?: string
  account_id?: string
  parameters?: unknown
  test?: boolean
  active?: boolean
  is_shippo_account?: boolean
  metadata?: string
  carrier_name: string
  carrier_images?: Record<string, string>
  object_info?: {
    authentication?: { type?: string }
  }
}

const CARRIERS_BASE = "/v1/company/shipments/carriers"

async function listCarriers(): Promise<ShippoCarrier[]> {
  const res = await apiClient.get(CARRIERS_BASE)
  const body = res.data
  if (Array.isArray(body)) return body as ShippoCarrier[]
  if (Array.isArray(body?.data)) return body.data as ShippoCarrier[]
  return []
}

async function getSavedCarrierIds(): Promise<string[]> {
  const res = await apiClient.get(`${CARRIERS_BASE}/saved`)
  const body = res.data
  if (Array.isArray(body)) return body as string[]
  if (Array.isArray(body?.data)) return body.data as string[]
  return []
}

async function setupCarriers(carrierObjectIds: string[]): Promise<{ message?: string }> {
  const payload = { carriers: carrierObjectIds }
  const res = await apiClient.post(CARRIERS_BASE, payload)
  const body = res.data
  if (typeof body === "object" && body) return body
  return { message: "Carriers saved successfully." }
}

export const shipmentsApi = {
  listCarriers,
  getSavedCarrierIds,
  setupCarriers,
}


