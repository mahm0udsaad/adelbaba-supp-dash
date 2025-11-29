import axios, { AxiosInstance, AxiosError } from "axios"
import { clearClientAuthState, isAuthErrorStatus } from "@/lib/auth/client-auth"

// Centralized Axios client used across the app
const apiClient: AxiosInstance = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "") + "/api",
  timeout: 300000, // 5 minutes (for large video uploads)
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Country": "EG",
  },
  withCredentials: false,
})

// Attach Authorization header from NextAuth session token if available
apiClient.interceptors.request.use(async (config) => {
  try {
    // Ensure X-Country header is always present
    config.headers = config.headers ?? {}
    config.headers["X-Country"] = "EG"
    
    if (typeof window !== "undefined") {
      const { getSession } = await import("next-auth/react")
      const session = await getSession()
      // Try multiple token shapes
      const token =
        ((session as any)?.token as string | undefined) ||
        ((session as any)?.accessToken as string | undefined) ||
        ((session as any)?.user?.appToken as string | undefined) ||
        // Fallback to localStorage cache saved by auth flow
        ((): string | undefined => {
          try {
            const raw = localStorage.getItem("adelbaba_auth_data")
            if (!raw) return undefined
            const parsed = JSON.parse(raw)
            return parsed?.token as string | undefined
          } catch {
            return undefined
          }
        })()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
  } catch (_) {
    // Safely ignore session errors
  }
  return config
})

function registerAuthFailureInterceptor(instance: AxiosInstance) {
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const status = error.response?.status
      if (isAuthErrorStatus(status)) {
        await clearClientAuthState().catch((cleanupError) => {
          console.error("[Auth] Failed to clear client auth state", cleanupError)
        })
      }
      return Promise.reject(error)
    }
  )
}

registerAuthFailureInterceptor(apiClient)
registerAuthFailureInterceptor(axios)

export default apiClient
