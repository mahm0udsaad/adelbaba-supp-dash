import { type NextRequest, NextResponse } from "next/server"
import quotesData from "@/mocks/quotes.json"

export async function POST(request: NextRequest, { params }: { params: { rfqId: string } }) {
  try {
    const body = await request.json()
    const { unitPrice, currency, moq, leadTimeDays, validityDays, paymentTerms, deliveryTerms, notes, specifications } =
      body

    // Create new quote
    const newQuote = {
      id: `QUO-${Date.now()}`,
      rfqId: params.rfqId,
      supplierId: "supplier_001",
      supplierName: "Al-Masri Trading Co.",
      unitPrice,
      currency: currency || "USD",
      moq,
      leadTimeDays,
      validityDays: validityDays || 30,
      paymentTerms,
      deliveryTerms,
      notes,
      status: "submitted",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [],
      specifications: specifications || [],
    }

    return NextResponse.json({
      data: newQuote,
      message: "Quote submitted successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Failed to submit quote",
        },
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest, { params }: { params: { rfqId: string } }) {
  try {
    const rfqQuotes = quotesData.filter((quote) => quote.rfqId === params.rfqId)

    return NextResponse.json({
      data: rfqQuotes,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Failed to fetch quotes",
        },
      },
      { status: 500 },
    )
  }
}
