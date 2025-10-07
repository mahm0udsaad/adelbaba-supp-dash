import apiClient from "@/lib/axios"

export interface InboxThreadSummary {
  id: string | number
  subject?: string
  from_name?: string
  from_company?: string
  from_email?: string
  avatar_url?: string
  status?: "unread" | "read" | "replied" | "urgent" | string
  priority?: "high" | "medium" | "low" | string
  category?: "inquiry" | "order" | "support" | "general" | string
  created_at?: string
  last_reply_at?: string
  tags?: string[]
}

export interface InboxListResponse {
  data?: InboxThreadSummary[]
  [key: string]: unknown
}

export interface InboxMessageAttachment {
  name: string
  size?: string | number
  type?: string
  url?: string
}

export interface InboxMessageItem {
  id: string | number
  content: string
  sender: "buyer" | "supplier" | string
  timestamp: string
  attachments: InboxMessageAttachment[]
}

export interface InboxThreadMessagesResponse {
  data?: {
    id: string | number
    subject?: string
    messages: InboxMessageItem[]
  }
  [key: string]: unknown
}

const BASE = "/v1/company/inbox"

export const inboxApi = {
  async list(params?: Record<string, unknown>): Promise<InboxThreadSummary[]> {
    const res = await apiClient.get<InboxListResponse>(`${BASE}`, { params })
    const rows = Array.isArray((res.data as any)?.data) ? (res.data as any).data : (res.data as any)
    return (rows as any[] | undefined) ?? []
  },

  async getMessages(id: string | number): Promise<InboxMessageItem[]> {
    const res = await apiClient.get<InboxThreadMessagesResponse>(`${BASE}/${id}/messages`)
    const payload = (res.data as any)?.data ?? (res.data as any)
    const messages = Array.isArray(payload?.messages) ? payload.messages : []
    return messages
  },

  async markRead(id: string | number): Promise<unknown> {
    const res = await apiClient.patch(`${BASE}/${id}/messages`)
    return res.data
  },

  async sendMessage(id: string | number, body: { type: string; content: string }): Promise<unknown> {
    const res = await apiClient.post(`${BASE}/${id}/messages`, body)
    return res.data
  },
}

