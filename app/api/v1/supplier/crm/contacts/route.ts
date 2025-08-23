import { type NextRequest, NextResponse } from "next/server"
import crmContacts from "@/mocks/crm-contacts.json"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.toLowerCase()
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    let filteredContacts = [...crmContacts]

    // Apply filters
    if (search) {
      filteredContacts = filteredContacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(search) ||
          contact.company.toLowerCase().includes(search) ||
          contact.email.toLowerCase().includes(search),
      )
    }

    if (status && status !== "all") {
      filteredContacts = filteredContacts.filter((contact) => contact.status === status)
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedContacts = filteredContacts.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedContacts,
      pagination: {
        page,
        limit,
        total: filteredContacts.length,
        totalPages: Math.ceil(filteredContacts.length / limit),
      },
    })
  } catch (error) {
    console.error("CRM Contacts API error:", error)
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newContact = {
      id: String(crmContacts.length + 1),
      ...body,
      totalOrders: 0,
      totalRevenue: 0,
      interactions: [],
    }

    return NextResponse.json({
      success: true,
      data: newContact,
      message: "Contact created successfully",
    })
  } catch (error) {
    console.error("Create contact API error:", error)
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 })
  }
}
