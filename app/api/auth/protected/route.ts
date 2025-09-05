import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/authOptions"

export async function GET() {
  const session = await getServerSession(authOptions)
  return new Response(JSON.stringify(session), {
    headers: { "Content-Type": "application/json" },
  })
}


