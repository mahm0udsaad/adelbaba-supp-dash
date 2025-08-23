import axios from "axios"

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_MODE === "real" ? process.env.NEXT_PUBLIC_API_BASE_URL : "/api",
  timeout: 10000,
})

// Request interceptor to add auth token and language
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token from localStorage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      // Add language header
      const language = localStorage.getItem("language") || "en"
      config.headers["Accept-Language"] = language
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

export default apiClient
