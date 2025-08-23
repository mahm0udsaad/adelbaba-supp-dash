import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    // In a real app, this would update the escrow status in the database
    const mockResponse = {
      id: params.orderId,
      tradeAssurance: {
        escrowStatus: "released",
        releaseDate: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      data: mockResponse,
      message: "Escrow funds released successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Failed to release escrow",
        },
      },
      { status: 500 },
    )
  }
}
