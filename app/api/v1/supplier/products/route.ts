import { type NextRequest, NextResponse } from "next/server"
import productsData from "@/mocks/products.json"

export async function GET(request: NextRequest) {
  console.log("[v0] Products API route called with URL:", request.url)
  console.log("[v0] Products data loaded:", productsData?.length || 0, "items")

  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const perPage = Number.parseInt(searchParams.get("perPage") || "10")
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    console.log("[v0] Query params:", { page, perPage, status, category, search })

    let filteredProducts = [...productsData]

    // Filter by status
    if (status && status !== "all") {
      filteredProducts = filteredProducts.filter((product) => product.status === status)
    }

    // Filter by category
    if (category && category !== "all") {
      filteredProducts = filteredProducts.filter((product) => product.categoryId === category)
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.title.toLowerCase().includes(searchLower) ||
          product.sku.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
      )
    }

    // Sort by creation date (newest first)
    filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Pagination
    const total = filteredProducts.length
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

    console.log("[v0] Returning products:", paginatedProducts.length, "of", total, "total")

    const response = {
      data: paginatedProducts,
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    }

    console.log("[v0] API response structure:", JSON.stringify(response, null, 2))

    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] Products API error:", error)
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Failed to fetch products",
        },
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      sku,
      categoryId,
      description,
      specs,
      moq,
      pricingTiers,
      sampleAvailable,
      samplePrice,
      status,
      visibility,
      tags,
      leadTimeDays,
    } = body

    // Create new product
    const newProduct = {
      id: `PROD-${Date.now()}`,
      title,
      sku,
      categoryId,
      category: "Electronics & Electrical", // In real app, lookup from categoryId
      images: ["/placeholder.svg?height=400&width=400&text=New+Product"],
      description,
      specs: specs || [],
      moq,
      pricingTiers: pricingTiers || [],
      sampleAvailable: sampleAvailable || false,
      samplePrice: samplePrice || 0,
      inventory: [],
      totalStock: 0,
      status: status || "draft",
      visibility: visibility || "private",
      tags: tags || [],
      certifications: [],
      leadTimeDays: leadTimeDays || 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      inquiries: 0,
      orders: 0,
    }

    return NextResponse.json({
      data: newProduct,
      message: "Product created successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Failed to create product",
        },
      },
      { status: 500 },
    )
  }
}
