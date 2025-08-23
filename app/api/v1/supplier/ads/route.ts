import { type NextRequest, NextResponse } from "next/server"
import adsData from "@/mocks/ads.json"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    let filteredAds = [...adsData]

    if (status && status !== "all") {
      filteredAds = filteredAds.filter((ad) => ad.status === status)
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedAds = filteredAds.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedAds,
      pagination: {
        page,
        limit,
        total: filteredAds.length,
        totalPages: Math.ceil(filteredAds.length / limit),
      },
    })
  } catch (error) {
    console.error("Ads API error:", error)
    return NextResponse.json({ error: "Failed to fetch ads" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newAd = {
      id: String(adsData.length + 1),
      ...body,
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      ctr: 0,
      cpc: 0,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: newAd,
      message: "Ad campaign created successfully",
    })
  } catch (error) {
    console.error("Create ad API error:", error)
    return NextResponse.json({ error: "Failed to create ad campaign" }, { status: 500 })
  }
}
