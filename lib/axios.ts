import axios, { AxiosInstance } from "axios"

// Centralized Axios client used across the app
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "/",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
})

// Attach Authorization header from localStorage token if available
apiClient.interceptors.request.use((config) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (token) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (_) {
    // Safely ignore storage errors
  }
  return config
})

// Response interceptor to handle 401 errors and session expiry
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 unauthorized responses
    if (error.response?.status === 401) {
      // Clear authentication data from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        localStorage.removeItem("roles")
        localStorage.removeItem("completion_status")
        localStorage.removeItem("profile")
        
        // Clear the authorization header
        delete apiClient.defaults.headers.Authorization
        
        // Redirect to login page (soft logout)
        window.location.href = "/login"
      }
    }
    
    return Promise.reject(error)
  }
)

export default apiClient

