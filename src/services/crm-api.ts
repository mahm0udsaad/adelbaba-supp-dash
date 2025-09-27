import apiClient from "@/lib/axios"

// API response types based on provided samples
export interface CRMContactCustomer {
  id: number
  name: string
  picture: string | null
  email: string
  phone: string | null
  has_company: boolean
  company_name: string | null
}

export interface CRMInteractionItem {
  id: number
  interaction_type: string
  title: string
  reference_id: number | null
  reference_type: string | null
  created_at: string
}

export interface CRMContactItem {
  id: number
  placed_orders: number
  paid_orders: number
  total_spent: string
  avg_order_value: string
  quotes_received: number
  rfqs_count: number
  tags: string[]
  created_at?: string
  updated_at?: string
  customer: CRMContactCustomer
  notes: string[]
}

export interface CRMContactDetail extends CRMContactItem {
  interactions?: CRMInteractionItem[]
}

export interface CRMListMeta {
  current_page: number
  per_page: number
  total: number
}

export interface CRMListResponse {
  data: CRMContactItem[]
  meta: CRMListMeta
}

export interface CRMDetailResponse {
  data: CRMContactDetail
}

export type CRMListQuery = {
  page?: number
  per_page?: number
  search?: string
  sort?: string
  order?: "asc" | "desc"
  status?: string
}

const BASE = "/v1/company/contacts"

export async function listContacts(params: CRMListQuery = {}): Promise<CRMListResponse> {
  const response = await apiClient.get<CRMListResponse>(BASE, { params })
  // Some backends omit meta or wrap differently; normalize minimal shape
  const body: any = response.data as any
  if (Array.isArray(body)) {
    return { data: body as CRMContactItem[], meta: { current_page: 1, per_page: body.length, total: body.length } }
  }
  if (Array.isArray(body?.data)) {
    return { data: body.data as CRMContactItem[], meta: body.meta as CRMListMeta }
  }
  return body as CRMListResponse
}

export async function getContact(id: number | string): Promise<CRMContactDetail> {
  const response = await apiClient.get<CRMDetailResponse>(`${BASE}/${id}`)
  const body: any = response.data as any
  return (body?.data ?? body) as CRMContactDetail
}

export const crmApi = {
  listContacts,
  getContact,
}


