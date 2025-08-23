import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    // Mock buyer confirming delivery - in real app this would be buyer-only action
    const mockResponse = {
      id: params.orderId,
      status: "delivered",
      shipping: {
        deliveredDate: new Date().toISOString(),
      },
      tradeAssurance: {
        escrowStatus: "released",
        releaseDate: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      data: mockResponse,
      message: "Delivery confirmed successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Failed to confirm delivery",
        },
      },
      { status: 500 },
    )
  }
}
