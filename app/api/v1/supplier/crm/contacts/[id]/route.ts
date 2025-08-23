import { type NextRequest, NextResponse } from "next/server"
import crmContacts from "@/mocks/crm-contacts.json"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const contact = crmContacts.find((c) => c.id === params.id)

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: contact,
    })
  } catch (error) {
    console.error("Get contact API error:", error)
    return NextResponse.json({ error: "Failed to fetch contact" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const contactIndex = crmContacts.findIndex((c) => c.id === params.id)

    if (contactIndex === -1) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }

    const updatedContact = {
      ...crmContacts[contactIndex],
      ...body,
    }

    return NextResponse.json({
      success: true,
      data: updatedContact,
      message: "Contact updated successfully",
    })
  } catch (error) {
    console.error("Update contact API error:", error)
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 })
  }
}
