import { type NextRequest, NextResponse } from "next/server"
import analyticsData from "@/mocks/analytics.json"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "6months"
    const metric = searchParams.get("metric")

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (metric) {
      const specificMetric = analyticsData.find((item) => item.id === metric)
      if (!specificMetric) {
        return NextResponse.json({ error: "Metric not found" }, { status: 404 })
      }
      return NextResponse.json(specificMetric)
    }

    // Return all analytics data
    return NextResponse.json({
      success: true,
      data: analyticsData,
      period,
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
