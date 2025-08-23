import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const body = await request.json()
    const { carrier, tracking, method } = body

    // In a real app, this would update the order in the database
    const mockResponse = {
      id: params.orderId,
      status: "shipped",
      shipping: {
        carrier,
        tracking,
        method,
        shippedDate: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      data: mockResponse,
      message: "Order shipped successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Failed to ship order",
        },
      },
      { status: 500 },
    )
  }
}
