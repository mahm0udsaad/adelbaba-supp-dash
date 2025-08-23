import { type NextRequest, NextResponse } from "next/server"
import productsData from "@/mocks/products.json"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = productsData.find((p) => p.id === params.id)

    if (!product) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Product not found",
          },
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      data: product,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Failed to fetch product",
        },
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    // In a real app, this would update the product in the database
    const updatedProduct = {
      id: params.id,
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      data: updatedProduct,
      message: "Product updated successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Failed to update product",
        },
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // In a real app, this would delete the product from the database
    return NextResponse.json({
      message: "Product deleted successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Failed to delete product",
        },
      },
      { status: 500 },
    )
  }
}
