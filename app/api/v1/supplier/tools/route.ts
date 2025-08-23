import { type NextRequest, NextResponse } from "next/server"
import toolsData from "@/mocks/tools.json"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const popular = searchParams.get("popular")

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    let filteredTools = [...toolsData]

    if (category && category !== "all") {
      filteredTools = filteredTools.filter((tool) => tool.category === category)
    }

    if (popular === "true") {
      filteredTools = filteredTools.filter((tool) => tool.popular)
    }

    return NextResponse.json({
      success: true,
      data: filteredTools,
    })
  } catch (error) {
    console.error("Tools API error:", error)
    return NextResponse.json({ error: "Failed to fetch tools" }, { status: 500 })
  }
}
