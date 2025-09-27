import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/authOptions"

const GRAPHQL_URL = "https://api.adil-baba.com/graphql"

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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions as any)
    const body = await req.json().catch(() => ({})) as any

    const startDate: string = body?.variables?.startDate || body?.startDate
    const endDate: string = body?.variables?.endDate || body?.endDate
    const limit: number = body?.variables?.limit || body?.limit || 10
    const query: string = body?.query || ANALYTICS_QUERY

    if (!startDate || !endDate) {
      return NextResponse.json({ errors: [{ message: "Missing startDate or endDate" }] }, { status: 400 })
    }

    const token = (session as any)?.token || (session as any)?.appToken
    const companyId = (session as any)?.company?.id

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (token) headers.Authorization = `Bearer ${token}`
    if (companyId) headers["X-Company-ID"] = String(companyId)

    const upstream = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables: { startDate, endDate, limit } }),
      cache: "no-store",
    })

    const text = await upstream.text()
    // Try parse JSON, otherwise pass text
    try {
      const json = JSON.parse(text)
      return NextResponse.json(json, {
        status: upstream.status,
        headers: { "Cache-Control": "no-store" },
      })
    } catch {
      return new NextResponse(text, {
        status: upstream.status,
        headers: { "Content-Type": upstream.headers.get("Content-Type") || "text/plain" },
      })
    }
  } catch (error: any) {
    return NextResponse.json({ errors: [{ message: error?.message || "Proxy error" }] }, { status: 500 })
  }
}


