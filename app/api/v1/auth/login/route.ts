import { type NextRequest, NextResponse } from "next/server"
import usersData from "@/mocks/users.json"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const user = usersData.find((u) => u.email === email && u.password === password)

    if (user) {
      const { password: _, ...userWithoutPassword } = user
      const mockToken = "mock_jwt_token_" + Date.now()

      return NextResponse.json({
        token: mockToken,
        user: userWithoutPassword,
        message: "Login successful",
      })
    }

    // Invalid credentials
    return NextResponse.json(
      {
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
      },
      { status: 401 },
    )
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
