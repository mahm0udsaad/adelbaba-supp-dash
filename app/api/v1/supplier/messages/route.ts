import { type NextRequest, NextResponse } from "next/server"
import messagesData from "@/mocks/messages.json"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    let filteredMessages = [...messagesData]

    if (status && status !== "all") {
      filteredMessages = filteredMessages.filter((msg) => msg.status === status)
    }

    if (category && category !== "all") {
      filteredMessages = filteredMessages.filter((msg) => msg.category === category)
    }

    // Sort by most recent
    filteredMessages.sort((a, b) => new Date(b.lastReply).getTime() - new Date(a.lastReply).getTime())

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedMessages = filteredMessages.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedMessages,
      pagination: {
        page,
        limit,
        total: filteredMessages.length,
        totalPages: Math.ceil(filteredMessages.length / limit),
      },
    })
  } catch (error) {
    console.error("Messages API error:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}
