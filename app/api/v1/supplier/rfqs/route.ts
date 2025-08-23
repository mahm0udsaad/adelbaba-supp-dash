import { type NextRequest, NextResponse } from "next/server"
import rfqsData from "@/mocks/rfqs.json"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const match = searchParams.get("match") === "true"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const perPage = Number.parseInt(searchParams.get("perPage") || "10")
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    let filteredRFQs = [...rfqsData]

    // Filter by status
    if (status && status !== "all") {
      filteredRFQs = filteredRFQs.filter((rfq) => rfq.status === status)
    }

    // Filter by category
    if (category && category !== "all") {
      filteredRFQs = filteredRFQs.filter((rfq) => rfq.categoryId === category)
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredRFQs = filteredRFQs.filter(
        (rfq) =>
          rfq.title.toLowerCase().includes(searchLower) ||
          rfq.buyerCompany.toLowerCase().includes(searchLower) ||
          rfq.description.toLowerCase().includes(searchLower),
      )
    }

    // If match=true, only show RFQs that match supplier's capabilities
    if (match) {
      // In a real app, this would filter based on supplier's product categories
      filteredRFQs = filteredRFQs.filter((rfq) => rfq.categoryId === "electronics" || rfq.categoryId === "textiles")
    }

    // Pagination
    const total = filteredRFQs.length
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    const paginatedRFQs = filteredRFQs.slice(startIndex, endIndex)

    return NextResponse.json({
      data: paginatedRFQs,
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
          message: "Failed to fetch RFQs",
        },
      },
      { status: 500 },
    )
  }
}
