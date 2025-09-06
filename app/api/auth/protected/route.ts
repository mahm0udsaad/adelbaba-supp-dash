import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/authOptions"

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    return new Response(JSON.stringify({ protected: session }), {
      headers: { "Content-Type": "application/json" },
    })
  } else {
    return new Response(JSON.stringify({ protected: false }), {
      headers: { "Content-Type": "application/json" },
    })
  }
}


