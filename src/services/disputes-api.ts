import apiClient from "@/lib/axios"

export interface DisputeOrder {
  id: number
  order_number: string
}

export interface DisputeListItem {
  id: number
  reason: string
  status: string
  created_at: string
  updated_at: string
  order: DisputeOrder
}

export interface DisputeMessage {
  id: number
  message: string
  sender_type: string
  created_at: string
}

export interface DisputeDetail extends DisputeListItem {
  description: string
  resolution: string | null
  messages: DisputeMessage[]
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

const BASE_URL = "/v1/company/disputes"

export async function listDisputes(params?: {
  page?: number
  status?: string
}): Promise<PaginatedResponse<DisputeListItem>> {
  const res = await apiClient.get(BASE_URL, { params })
  return res.data
}

export async function getDispute(
  id: number | string
): Promise<DisputeDetail> {
  const res = await apiClient.get(`${BASE_URL}/${id}`)
  return res.data?.data || res.data
}

export const disputesApi = {
  list: listDisputes,
  get: getDispute,
}

