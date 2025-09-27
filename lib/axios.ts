import axios, { AxiosInstance } from "axios"

// Centralized Axios client used across the app
const apiClient: AxiosInstance = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "") + "/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
})

// Attach Authorization header from NextAuth session token if available
apiClient.interceptors.request.use(async (config) => {
  try {
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
        config.headers = config.headers ?? {}
        config.headers.Authorization = `Bearer ${token}`
      }
    }
  } catch (_) {
    // Safely ignore session errors
  }
  return config
})

// Response interceptor to handle 401 errors and session expiry
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 unauthorized responses
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        if (typeof window !== 'undefined') {
          const { getSession, signOut } = await import('next-auth/react')
          const session = await getSession()
          const refreshedToken =
            (session as any)?.token ||
            (session as any)?.accessToken ||
            (session as any)?.user?.appToken

          if (refreshedToken) {
            originalRequest.headers = originalRequest.headers ?? {}
            originalRequest.headers.Authorization = `Bearer ${refreshedToken}`
            return apiClient(originalRequest)
          }

          await signOut({ redirect: true, callbackUrl: '/login' })
        }
      } catch (refreshError) {
        // If anything fails, force sign out
        if (typeof window !== 'undefined') {
          const { signOut } = await import('next-auth/react')
          await signOut({ redirect: true, callbackUrl: '/login' })
        }
      }
    }
    
    return Promise.reject(error)
  }
)

export default apiClient

