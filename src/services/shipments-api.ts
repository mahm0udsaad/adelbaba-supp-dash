import apiClient from "@/lib/axios"

export interface ShipmentParcel {
  id: string
  length: string
  width: string
  height: string
  distance_unit: string
  weight: string
  mass_unit: string
}

export interface ShipmentAddress {
  name: string
  street1: string
  street2?: string
  city: string
  state: string
  zip: string
  country: string
  phone?: string
  email?: string
}

export interface ShipmentRate {
  object_id: string
  amount: string
  currency: string
  provider: string
  servicelevel_name: string
  estimated_days?: number
}

export interface ShipmentListItem {
  id: string | number
  object_id?: string
  status: string
  tracking_number?: string
  carrier?: string
  service_level?: string
  amount?: string
  currency?: string
  created_at: string
  updated_at: string
  address_from: ShipmentAddress
  address_to: ShipmentAddress
  parcels: ShipmentParcel[]
}

export interface ShipmentDetail extends ShipmentListItem {
  rates?: ShipmentRate[]
  tracking_status?: string
  tracking_history?: Array<{
    status: string
    status_date: string
    location?: string
  }>
}

export interface PaginatedResponse<T> {
  data: T[]
  links: unknown
  meta: {
    current_page?: number
    last_page?: number
    per_page?: number
    total?: number
  }
}

export interface ShippoCarrier {
  carrier: string
  object_id: string
  carrier_name: string
  active?: boolean
}

const BASE_URL = "/v1/company/shipments"

export async function listShipments(params?: {
  page?: number
  status?: string
}): Promise<PaginatedResponse<ShipmentListItem>> {
  const res = await apiClient.get(BASE_URL, { params })
  return res.data
}

export async function getShipment(
  id: number | string
): Promise<ShipmentDetail> {
  const res = await apiClient.get(`${BASE_URL}/${id}`)
  return res.data?.data || res.data
}

export async function listCarriers(): Promise<ShippoCarrier[]> {
  const res = await apiClient.get(`${BASE_URL}/carriers`)
  return res.data?.data || res.data || []
}

export async function getSavedCarrierIds(): Promise<string[]> {
  const res = await apiClient.get(`${BASE_URL}/carriers/saved`)
  return res.data?.data || res.data || []
}

export async function setupCarriers(
  carrierObjectIds: string[]
): Promise<{ message?: string }> {
  const res = await apiClient.post(`${BASE_URL}/carriers`, {
    carriers: carrierObjectIds,
  })
  return res.data
}

export const shipmentsApiNew = {
  list: listShipments,
  get: getShipment,
  listCarriers,
  getSavedCarrierIds,
  setupCarriers,
}

