import { type NextRequest, NextResponse } from "next/server"
import certificatesData from "@/mocks/certificates.json"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const status = searchParams.get("status")

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    let filteredCertificates = [...certificatesData]

    if (type && type !== "all") {
      filteredCertificates = filteredCertificates.filter((cert) => cert.type === type)
    }

    if (status && status !== "all") {
      filteredCertificates = filteredCertificates.filter((cert) => cert.status === status)
    }

    return NextResponse.json({
      success: true,
      data: filteredCertificates,
    })
  } catch (error) {
    console.error("Certificates API error:", error)
    return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newCertificate = {
      id: String(certificatesData.length + 1),
      ...body,
      status: "active",
    }

    return NextResponse.json({
      success: true,
      data: newCertificate,
      message: "Certificate added successfully",
    })
  } catch (error) {
    console.error("Add certificate API error:", error)
    return NextResponse.json({ error: "Failed to add certificate" }, { status: 500 })
  }
}
