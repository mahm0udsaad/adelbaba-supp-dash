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
  description: string
  created_at: string
  updated_at: string
  reference_id: number | null
  reference_type: string | null
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
  notes: CRMNote[]
}

export interface CRMContactDetail extends CRMContactItem {
  interactions?: CRMInteractionItem[]
}

export interface CRMNote {
  id: number
  note: string
  created_at: string
  updated_at: string
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
  // additional filters supported by backend
  sort_by?: string
  date_from?: string
  date_to?: string
  region_id?: string | number
  has_orders?: string | boolean
  tags?: string // comma separated
  buyer_type?: "new" | "repeated"
  // keep current UI fields for compatibility
  search?: string
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
  updateTags,
  addNote,
  editNote,
  deleteNote,
  addInteraction,
  exportContacts,
}


// --- Mutations ---

export async function updateTags(id: number | string, tags: string[]): Promise<CRMContactDetail> {
  const response = await apiClient.post(`${BASE}/${id}/tags`, { tags })
  const body: any = response.data as any
  // Some APIs return the updated contact under different keys
  return (body?.data ?? body?.note ?? body) as CRMContactDetail
}

export async function addNote(id: number | string, note: string): Promise<CRMNote> {
  const response = await apiClient.post(`${BASE}/${id}/note`, { note })
  const body: any = response.data as any
  return (body?.note ?? body) as CRMNote
}

export async function editNote(contactId: number | string, noteId: number | string, note: string): Promise<CRMNote> {
  const response = await apiClient.put(`${BASE}/${contactId}/note/${noteId}`, { note })
  const body: any = response.data as any
  return (body?.note ?? body) as CRMNote
}

export async function deleteNote(contactId: number | string, noteId: number | string): Promise<CRMNote> {
  const response = await apiClient.delete(`${BASE}/${contactId}/note/${noteId}`)
  const body: any = response.data as any
  return (body?.note ?? body) as CRMNote
}

export type AddInteractionPayload = {
  interaction_type: "call" | "email" | "meeting" | "order" | "other"
  title: string
  details?: string | null
}

export async function addInteraction(id: number | string, payload: AddInteractionPayload): Promise<CRMInteractionItem> {
  const response = await apiClient.post(`${BASE}/${id}/interaction`, payload)
  const body: any = response.data as any
  return (body?.interaction ?? body) as CRMInteractionItem
}

export type ExportContactsPayload = {
  date_from?: string
  date_to?: string
  region_id?: number
  ids?: number[]
  format: "csv" | "xlsx"
}

export async function exportContacts(payload: ExportContactsPayload): Promise<Blob> {
  const response = await apiClient.post(`${BASE}/export`, payload, { responseType: "blob" as any })
  return response.data as Blob
}

