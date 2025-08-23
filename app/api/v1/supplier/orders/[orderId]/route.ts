import { type NextRequest, NextResponse } from "next/server"
import ordersData from "@/mocks/orders.json"

export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const order = ordersData.find((o) => o.id === params.orderId)

    if (!order) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Order not found",
          },
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      data: order,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Failed to fetch order",
        },
      },
      { status: 500 },
    )
  }
}
