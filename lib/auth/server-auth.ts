import { cookies } from "next/headers"

const SESSION_COOKIE_NAMES = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.callback-url",
  "next-auth.csrf-token",
  "__Host-next-auth.csrf-token",
]

export function clearServerAuthCookies(): void {
  try {
    const store = cookies()
    SESSION_COOKIE_NAMES.forEach((name) => {
      try {
        store.delete(name)
      } catch (error) {
        console.error(`[Auth] Failed to delete cookie ${name}`, error)
      }
    })
  } catch (error) {
    console.error("[Auth] Failed to access cookies() for cleanup", error)
  }
}
