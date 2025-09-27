"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import axios from "axios"
import { format, parseISO } from "date-fns"
import type { AnalyticsData } from "@/components/pages/dashboard/analytics/components/types"
import analyticsMockJson from "@/mocks/analytics.json"

type AnalyticsContextValue = {
  data: AnalyticsData | null
  loading: boolean
  error?: string
  refetch: () => Promise<void>
}

const AnalyticsContext = createContext<AnalyticsContextValue | undefined>(undefined)

type AnalyticsProviderProps = {
  startDate: string // yyyy-MM-dd
  endDate: string // yyyy-MM-dd
  limit?: number
  children: React.ReactNode
}

const GRAPHQL_URL = "https://api.adil-baba.com/graphql"

type GQLTopProduct = {
  productId: string
  productImage?: string | null
  productName: string
  totalAddedToCart: number
  totalClicks: number
  totalFavorites: number
  totalOrderPaid: number
  totalOrdersCreated: number
  totalRevenue: number
  totalViews: number
}

type GQLOutput = {
  data?: {
    topProducts: GQLTopProduct[]
    orderAnalyticsSummary: {
      averageOrderValue: number
      ordersByDate: Array<{ count: number; date: string; totalAmount: number }>
      paymentStatus: {
        cancelled: number
        completed: number
        expired: number
        failed: number
        pending: number
        processing: number
        refunded: number
      }
      revenueTrend: Array<{ count: number; date: string; totalAmount: number }>
      totalOrders: number
      totalRevenue: number
    }
    productAnalyticsSummary: {
      totalAddedToCart: number
      totalClick: number
      totalFavorites: number
      totalOrderPaid: number
      totalOrdersCreated: number
      totalRevenue: number
      totalViews: number
    }
  }
  errors?: Array<{ message: string }>
}

const ANALYTICS_QUERY = `
  query Analytics($startDate: String!, $endDate: String!, $limit: Int!) {
    topProducts(endDate: $endDate, startDate: $startDate, limit: $limit) {
      productId
      productImage
      productName
      totalAddedToCart
      totalClicks
      totalFavorites
      totalOrderPaid
      totalOrdersCreated
      totalRevenue
      totalViews
    }
    orderAnalyticsSummary(endDate: $endDate, startDate: $startDate) {
      averageOrderValue
      ordersByDate { count date totalAmount }
      paymentStatus { cancelled completed expired failed pending processing refunded }
      revenueTrend { count date totalAmount }
      totalOrders
      totalRevenue
    }
    productAnalyticsSummary(endDate: $endDate, startDate: $startDate) {
      totalAddedToCart
      totalClick
      totalFavorites
      totalOrderPaid
      totalOrdersCreated
      totalRevenue
      totalViews
    }
  }
`

async function getAuthToken(): Promise<string | undefined> {
  try {
    if (typeof window !== "undefined") {
      const { getSession } = await import("next-auth/react")
      const session = await getSession()
      const token =
        ((session as any)?.token as string | undefined) ||
        ((session as any)?.accessToken as string | undefined) ||
        ((session as any)?.user?.appToken as string | undefined) ||
        ((): string | undefined => {
          try {
            const raw = localStorage.getItem("adelbaba_auth_data")
            if (!raw) return undefined
            const parsed = JSON.parse(raw)
            return parsed?.token as string | undefined
          } catch {
            return undefined
          }
        })()
      return token
    }
  } catch {
    // ignore
  }
  return undefined
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {}
  const token = await getAuthToken()
  if (token) headers.Authorization = `Bearer ${token}`
  try {
    if (typeof window !== "undefined") {
      const { getSession } = await import("next-auth/react")
      const session = await getSession()
      const companyId = (session as any)?.company?.id || ((): number | undefined => {
        try {
          const raw = localStorage.getItem("adelbaba_company_data")
          if (!raw) return undefined
          const parsed = JSON.parse(raw)
          return parsed?.id as number | undefined
        } catch {
          return undefined
        }
      })()
      if (companyId) {
        headers["X-Company-ID"] = String(companyId)
      }
    }
  } catch {
    // ignore
  }
  return headers
}

function mapToAnalyticsData(api: NonNullable<GQLOutput["data"]>): AnalyticsData {
  const revenueTrend = api.orderAnalyticsSummary?.revenueTrend || []
  const ordersByDate = api.orderAnalyticsSummary?.ordersByDate || []

  // Filter out zero values for growth calculation
  const nonZeroRevenueTrend = revenueTrend.filter(item => item.totalAmount > 0)
  const nonZeroOrdersTrend = ordersByDate.filter(item => item.count > 0)

  // Calculate growth based on non-zero values
  let revenueGrowth = 0
  if (nonZeroRevenueTrend.length >= 2) {
    const lastRevenue = nonZeroRevenueTrend[nonZeroRevenueTrend.length - 1]?.totalAmount || 0
    const prevRevenue = nonZeroRevenueTrend[nonZeroRevenueTrend.length - 2]?.totalAmount || 0
    revenueGrowth = prevRevenue > 0 ? ((lastRevenue - prevRevenue) / prevRevenue) * 100 : 0
  }

  let orderGrowth = 0
  if (nonZeroOrdersTrend.length >= 2) {
    const lastOrders = nonZeroOrdersTrend[nonZeroOrdersTrend.length - 1]?.count || 0
    const prevOrders = nonZeroOrdersTrend[nonZeroOrdersTrend.length - 2]?.count || 0
    orderGrowth = prevOrders > 0 ? ((lastOrders - prevOrders) / prevOrders) * 100 : 0
  }

  // Get current period values (most recent non-zero or last item)
  const currentRevenue = nonZeroRevenueTrend.length > 0 
    ? nonZeroRevenueTrend[nonZeroRevenueTrend.length - 1].totalAmount 
    : revenueTrend[revenueTrend.length - 1]?.totalAmount || 0

  const currentOrders = nonZeroOrdersTrend.length > 0
    ? nonZeroOrdersTrend[nonZeroOrdersTrend.length - 1].count
    : ordersByDate[ordersByDate.length - 1]?.count || 0

  // Aggregate orders by month label to align with revenueTrend
  const ordersByMonth = new Map<string, number>()
  ordersByDate.forEach((o) => {
    const monthKey = formatApiMonth(o.date)
    ordersByMonth.set(monthKey, (ordersByMonth.get(monthKey) || 0) + (o.count || 0))
  })

  // Map monthly data - handle the API date format
  const monthlyData = revenueTrend.map((r) => {
    const month = formatApiMonth(r.date)
    const orders = ordersByMonth.get(month) || 0
    return { month, revenue: r.totalAmount || 0, orders }
  })

  // Payment status breakdown
  const payment = api.orderAnalyticsSummary?.paymentStatus || ({} as any)
  const statusPairs: Array<{ status: string; count: number }> = [
    { status: "Completed", count: payment.completed || 0 },
    { status: "Processing", count: payment.processing || 0 },
    { status: "Pending", count: payment.pending || 0 },
    { status: "Cancelled", count: payment.cancelled || 0 },
    { status: "Expired", count: payment.expired || 0 },
    { status: "Failed", count: payment.failed || 0 },
    { status: "Refunded", count: payment.refunded || 0 },
  ]
  
  const statusTotal = statusPairs.reduce((sum, s) => sum + (s.count || 0), 0) || api.orderAnalyticsSummary?.totalOrders || 0
  const statusBreakdown = statusPairs
    .filter((s) => s.count > 0)
    .map((s) => ({ 
      status: s.status, 
      count: s.count, 
      percentage: statusTotal > 0 ? (s.count / statusTotal) * 100 : 0 
    }))

  // Top products mapping
  const topProducts = (api.topProducts || []).map((p) => ({
    id: p.productId,
    name: p.productName,
    sales: p.totalOrdersCreated || 0,
    revenue: p.totalRevenue || 0,
  }))

  // Buyers data (still mocked)
  const buyersMockItem = Array.isArray(analyticsMockJson)
    ? (analyticsMockJson as any[]).find((x) => x?.id === "buyers")?.data
    : undefined

  const data: AnalyticsData = {
    revenue: {
      totalRevenue: api.orderAnalyticsSummary?.totalRevenue || 0,
      monthlyRevenue: currentRevenue,
      revenueGrowth,
      monthlyData,
    },
    orders: {
      totalOrders: api.orderAnalyticsSummary?.totalOrders || 0,
      monthlyOrders: currentOrders,
      orderGrowth,
      statusBreakdown,
    },
    products: {
      totalProducts: topProducts.length,
      activeProducts: topProducts.length,
      topProducts,
    },
    buyers: buyersMockItem || {
      totalBuyers: 0,
      activeBuyers: 0,
      newBuyers: 0,
      buyerGrowth: 0,
      topBuyers: [],
    },
  }

  return data
}

function formatApiMonth(dateStr: string): string {
  // Handle the API's date format which comes as "Sep 2025" or "2025-09-27"
  try {
    // If it's already in "MMM YYYY" format, extract just the month
    if (dateStr.includes(' ') && !dateStr.includes('-')) {
      return dateStr.split(' ')[0]
    }
    
    // If it's in ISO format, parse and format
    if (dateStr.includes('-')) {
      return format(parseISO(dateStr), "MMM")
    }
    
    // Fallback: return as-is
    return dateStr
  } catch {
    return dateStr
  }
}

export function AnalyticsProvider({ startDate, endDate, limit = 10, children }: AnalyticsProviderProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(undefined)
    try {
      // Use internal API route to avoid CORS and let the server attach auth headers
      const response = await axios.post<GQLOutput>(
        "/api/analytics",
        { query: ANALYTICS_QUERY, variables: { startDate, endDate, limit } },
        { headers: { "Content-Type": "application/json" } },
      )
      
      if (response.data?.errors?.length) {
        throw new Error(response.data.errors.map((e) => e.message).join("; "))
      }
      
      const api = response.data?.data
      if (!api) {
        setData(null)
      } else {
        setData(mapToAnalyticsData(api))
      }
    } catch (err: any) {
      console.error("Analytics fetch error:", err)
      setError(err?.message || "Failed to load analytics")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, limit])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const value: AnalyticsContextValue = useMemo(
    () => ({ data, loading, error, refetch: fetchData }),
    [data, loading, error, fetchData],
  )

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}

export function useAnalytics() {
  const ctx = useContext(AnalyticsContext)
  if (!ctx) throw new Error("useAnalytics must be used within AnalyticsProvider")
  return ctx
}