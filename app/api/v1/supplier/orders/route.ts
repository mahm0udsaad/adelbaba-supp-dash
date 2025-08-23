import { type NextRequest, NextResponse } from "next/server"
import ordersData from "@/mocks/orders.json"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const perPage = Number.parseInt(searchParams.get("perPage") || "10")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    let filteredOrders = [...ordersData]

    // Filter by status
    if (status && status !== "all") {
      filteredOrders = filteredOrders.filter((order) => order.status === status)
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredOrders = filteredOrders.filter(
        (order) =>
          order.id.toLowerCase().includes(searchLower) ||
          order.buyerCompany.toLowerCase().includes(searchLower) ||
          order.items.some((item) => item.productName.toLowerCase().includes(searchLower)),
      )
    }

    // Sort by creation date (newest first)
    filteredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Pagination
    const total = filteredOrders.length
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

    return NextResponse.json({
      data: paginatedOrders,
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Failed to fetch orders",
        },
      },
      { status: 500 },
    )
  }
}
