import apiClient from "@/lib/axios"

export interface OrderProduct {
  id: number
  name: string
  sku: string
  image: string
}

export interface OrderItem {
  id: number
  quantity: number
  price_per_unit: string
  customization: string | null
  product: OrderProduct
}

export interface OrderListItem {
  id: number
  order_number: string
  status: string
  total_amount: string
  created_at: string
  updated_at: string
  expires_at: string | null
  user: {
    id: number
    name: string
    email: string
  }
  items_count: number
}

export interface OrderDetail extends OrderListItem {
  notes: string | null
  shipping: string | null
  tax: string | null
  items: OrderItem[]
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

const BASE_URL = "/v1/company/orders"

export async function listOrders(params?: {
  page?: number
  status?: string
}): Promise<PaginatedResponse<OrderListItem>> {
  const res = await apiClient.get(BASE_URL, { params })
  return res.data
}

export async function getOrder(id: number | string): Promise<OrderDetail> {
  const res = await apiClient.get(`${BASE_URL}/${id}`)
  return res.data?.data || res.data
}

export async function updateOrderStatus(
  id: number | string,
  status: string
): Promise<{ message: string }> {
  const res = await apiClient.post(`${BASE_URL}/${id}/status`, { status })
  return res.data
}

export async function getOrderInvoice(
  id: number | string
): Promise<Blob> {
  const res = await apiClient.get(`${BASE_URL}/${id}/invoice`, {
    responseType: "blob",
  })
  return res.data
}

export async function listOrderPayments(params?: {
  page?: number
}): Promise<PaginatedResponse<any>> {
  const res = await apiClient.get(`${BASE_URL}/payments`, { params })
  return res.data
}

export const ordersApi = {
  list: listOrders,
  get: getOrder,
  updateStatus: updateOrderStatus,
  getInvoice: getOrderInvoice,
  listPayments: listOrderPayments,
}

