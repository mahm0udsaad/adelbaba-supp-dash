import { type NextRequest, NextResponse } from "next/server"
import usersData from "@/mocks/users.json"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "No valid token provided",
          },
        },
        { status: 401 },
      )
    }

    const mockUser = usersData[0]
    const { password: _, ...userWithoutPassword } = mockUser

    return NextResponse.json({
      data: userWithoutPassword,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Internal server error",
        },
      },
      { status: 500 },
    )
  }
}
