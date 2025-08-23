import { type NextRequest, NextResponse } from "next/server"
import inventoryData from "@/mocks/inventory.json"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id

    // Find inventory data for the specific product
    const productInventory = inventoryData.find((item) => item.productId === productId)

    if (!productInventory) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Product inventory not found",
          },
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      data: productInventory,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Failed to fetch inventory",
        },
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { warehouseId, adjustment, reason } = body

    // In a real app, this would update the inventory in the database
    const mockResponse = {
      productId: params.id,
      warehouseId,
      adjustment,
      reason,
      newStock: Math.max(0, 100 + adjustment), // Mock calculation
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      data: mockResponse,
      message: "Inventory updated successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Failed to update inventory",
        },
      },
      { status: 500 },
    )
  }
}
