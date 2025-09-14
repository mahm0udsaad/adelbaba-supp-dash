import apiClient from "@/lib/axios"

export interface QuoteListItem {
  id: number | string
  rfq_id?: number | string
  message?: string
  currency?: string
  lead_time_days?: number
  status?: string
  created_at?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  links: unknown
  meta: {
    current_page?: number
    last_page?: number
    per_page?: number
    total?: number
    from?: number | null
    to?: number | null
    path?: string
    [key: string]: unknown
  }
}

const BASE_URL = "/v1/company/quotes"

export async function listQuotes(params: { page?: number } = {}): Promise<PaginatedResponse<QuoteListItem>> {
  const response = await apiClient.get(BASE_URL, { params })
  return response.data
}

export async function getQuote(id: number | string): Promise<{ data: QuoteListItem } | QuoteListItem> {
  const response = await apiClient.get(`${BASE_URL}/${id}`)
  return response.data
}

export interface CreateQuotePayload {
  rfq_id: number | string
  message: string
  currency: string
  lead_time_days?: number
  attachments?: File[]
}

export async function createQuote(payload: CreateQuotePayload): Promise<unknown> {
  const formData = new FormData()
  formData.append("rfq_id", String(payload.rfq_id))
  formData.append("message", payload.message)
  formData.append("currency", payload.currency)
  if (payload.lead_time_days !== undefined) {
    formData.append("lead_time_days", String(payload.lead_time_days))
  }
  if (payload.attachments && payload.attachments.length > 0) {
    payload.attachments.forEach((file) => formData.append("attachments[]", file))
  }

  const response = await apiClient.post(BASE_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return response.data
}

export async function withdrawQuote(id: number | string): Promise<unknown> {
  const response = await apiClient.post(`${BASE_URL}/${id}/withdraw`)
  return response.data
}


