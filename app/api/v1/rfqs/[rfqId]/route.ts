import { type NextRequest, NextResponse } from "next/server"
import rfqsData from "@/mocks/rfqs.json"

export async function GET(request: NextRequest, { params }: { params: { rfqId: string } }) {
  try {
    const rfq = rfqsData.find((r) => r.id === params.rfqId)

    if (!rfq) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "RFQ not found",
          },
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      data: rfq,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Failed to fetch RFQ",
        },
      },
      { status: 500 },
    )
  }
}
