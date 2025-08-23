import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const body = await request.json()
    const { reason, files } = body

    // In a real app, this would create a dispute record in the database
    const mockDispute = {
      id: `DISPUTE-${Date.now()}`,
      orderId: params.orderId,
      reason,
      files: files || [],
      status: "open",
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      data: mockDispute,
      message: "Dispute created successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Failed to create dispute",
        },
      },
      { status: 500 },
    )
  }
}
