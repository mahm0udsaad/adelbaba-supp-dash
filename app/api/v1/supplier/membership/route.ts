import { type NextRequest, NextResponse } from "next/server"
import membershipData from "@/mocks/membership.json"

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(membershipData)
  } catch (error) {
    console.error("Error fetching membership data:", error)
    return NextResponse.json({ error: "Failed to fetch membership data" }, { status: 500 })
  }
}
