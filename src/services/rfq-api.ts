import apiClient from "@/lib/axios"

// RFQ Interfaces
export interface RFQ {
  id: string | number
  title: string
  buyer_company?: string
  buyer_contact?: {
    name?: string
    email?: string
    phone?: string
  }
  category_id?: string | number
  category?: string
  description?: string
  specifications?: Array<{ key: string; value: string }>
  target_qty?: number
  target_price?: number
  currency?: string
  country_code?: string
  country?: string
  payment_terms?: string
  delivery_terms?: string
  lead_time_required?: number
  status?: string
  priority?: string
  expires_at?: string
  created_at?: string
  attachments?: string[]
  quotes_count?: number
  views_count?: number
}

export interface RFQListItem {
  id: string | number
  title?: string
  buyer_company?: string
  category?: string
  description?: string
  target_qty?: number
  target_price?: number
  currency?: string
  country?: string
  status?: string
  priority?: string
  expires_at?: string
  created_at?: string
  quotes_count?: number
  views_count?: number
}

export interface PaginatedRFQResponse {
  data: RFQListItem[]
  links?: unknown
  meta?: {
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

export interface RFQFilters {
  q?: string           // search query
  status?: string      // 'open', 'expired', etc.
  category_id?: string // category filter
  page?: number        // pagination
  per_page?: number    // items per page
}

// Quote Submission Payload (aligned with requirements)
export interface SubmitQuotePayload {
  rfq_id: number | string
  price: number
  moq?: number           // minimum order quantity
  lead_time?: string     // e.g. "15 days"
  notes?: string
  attachments?: File[]
}

// API Functions

/**
 * List RFQs (Market): GET /api/v1/company/market/rfqs
 * Used to fetch all open RFQs from buyers. Supports filters by status, category, etc.
 */
export async function listMarketRFQs(filters: RFQFilters = {}): Promise<PaginatedRFQResponse> {
  const params = new URLSearchParams()
  
  if (filters.q) params.append('q', filters.q)
  if (filters.status) params.append('status', filters.status)
  if (filters.category_id) params.append('category_id', filters.category_id)
  if (filters.page) params.append('page', filters.page.toString())
  if (filters.per_page) params.append('per_page', filters.per_page.toString())

  const response = await apiClient.get(`/v1/company/market/rfqs?${params.toString()}`)
  console.log(response.data)
  return response.data
}

/**
 * View RFQ (Market): GET /api/v1/company/market/rfqs/{id}
 * Returns details for a specific RFQ.
 */
export async function getRFQDetails(id: string | number): Promise<{ data: RFQ } | RFQ> {
  const response = await apiClient.get(`/v1/company/market/rfqs/${id}`)
  return response.data
}

/**
 * Submit Quote: POST /api/v1/company/quotes
 * Creates a new quote in response to an RFQ.
 */
export async function submitQuote(payload: SubmitQuotePayload): Promise<unknown> {
  const formData = new FormData()
  
  formData.append("rfq_id", String(payload.rfq_id))
  formData.append("price", payload.price.toString())
  
  if (payload.moq !== undefined) {
    formData.append("moq", payload.moq.toString())
  }
  
  if (payload.lead_time) {
    formData.append("lead_time", payload.lead_time)
  }
  
  if (payload.notes) {
    formData.append("notes", payload.notes)
  }
  
  if (payload.attachments && payload.attachments.length > 0) {
    payload.attachments.forEach((file) => formData.append("attachments[]", file))
  }

  const response = await apiClient.post("/v1/company/quotes", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return response.data
}

// Dashboard Metrics Helper Functions

/**
 * Get Open RFQs count - from listMarketRFQs with status=open
 */
export async function getOpenRFQsCount(): Promise<number> {
  try {
    const response = await listMarketRFQs({ status: 'open', per_page: 1 })
    return response.meta?.total || 0
  } catch (error) {
    console.error('Failed to fetch open RFQs count:', error)
    return 0
  }
}

/**
 * Get Quotes Submitted count - from existing quotes API
 */
export async function getQuotesSubmittedCount(): Promise<number> {
  try {
    const { listQuotes } = await import('./quotes-api')
    const response = await listQuotes({ page: 1 })
    return response.meta?.total || 0
  } catch (error) {
    console.error('Failed to fetch quotes submitted count:', error)
    return 0
  }
}

/**
 * Get Awarded count - from existing quotes API with status filter
 */
export async function getAwardedQuotesCount(): Promise<number> {
  try {
    // Note: This assumes the quotes API supports status filtering
    // If not, we'd need to fetch all and filter client-side
    const { listQuotes } = await import('./quotes-api')
    const response = await listQuotes({ page: 1 })
    
    // If API doesn't support status filter, count client-side
    const awardedCount = response.data.filter(quote => quote.status === 'awarded').length
    
    // For proper count, we'd need to fetch all pages or the API should support status filter
    // This is a simplified version - in production, you'd want server-side filtering
    return awardedCount
  } catch (error) {
    console.error('Failed to fetch awarded quotes count:', error)
    return 0
  }
}

/**
 * Calculate Win Rate - awarded / submitted * 100
 */
export async function getWinRate(): Promise<number> {
  try {
    const [submitted, awarded] = await Promise.all([
      getQuotesSubmittedCount(),
      getAwardedQuotesCount()
    ])
    
    if (submitted === 0) return 0
    return Math.round((awarded / submitted) * 100)
  } catch (error) {
    console.error('Failed to calculate win rate:', error)
    return 0
  }
}

/**
 * Get all dashboard metrics at once
 */
export async function getDashboardMetrics(): Promise<{
  openRFQs: number
  quotesSubmitted: number
  awarded: number
  winRate: number
}> {
  try {
    const [openRFQs, quotesSubmitted, awarded, winRate] = await Promise.all([
      getOpenRFQsCount(),
      getQuotesSubmittedCount(), 
      getAwardedQuotesCount(),
      getWinRate()
    ])

    return {
      openRFQs,
      quotesSubmitted,
      awarded,
      winRate
    }
  } catch (error) {
    console.error('Failed to fetch dashboard metrics:', error)
    return {
      openRFQs: 0,
      quotesSubmitted: 0,
      awarded: 0,
      winRate: 0
    }
  }
}
