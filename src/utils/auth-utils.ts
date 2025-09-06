/**
 * Authentication utility functions for handling data persistence and flow
 */

export interface AuthData {
  user: any
  company: any
  roles: string[]
  completionStatus: any
  token: string
}

export interface CompanyData {
  id: number
  name: string
  description: string
  founded_year: number
  is_active: boolean
  verified_at: string | null
  location: string
  logo: string
  owner: any
  contacts: Array<{
    id: number
    phone: string
    email: string
    is_primary: number
    created_at: string
    updated_at: string
  }>
  city: {
    id: number
    name: string
  }
  region: {
    id: number
    name: string
    picture: string
  }
  state: {
    id: number
    name: string
  }
  supplier: {
    id: number
    name: string
    location: string
    logo: string
    on_time_delivery_rate: string
    rating: string
    status: string
  }
}

// localStorage keys
const AUTH_DATA_KEY = "adelbaba_auth_data"
const COMPANY_DATA_KEY = "adelbaba_company_data"

/**
 * Save authentication data to localStorage
 */
export function saveAuthDataToStorage(authData: AuthData): void {
  if (typeof window === "undefined") return
  
  try {
    // Don't save token to localStorage for security reasons
    const dataToStore = {
      ...authData,
      token: null,
    }
    localStorage.setItem(AUTH_DATA_KEY, JSON.stringify(dataToStore))
    
    // Save company data separately if it exists
    if (authData.company) {
      localStorage.setItem(COMPANY_DATA_KEY, JSON.stringify(authData.company))
    }
  } catch (error) {
    console.error("Failed to save auth data to localStorage:", error)
  }
}

/**
 * Load authentication data from localStorage
 */
export function loadAuthDataFromStorage(): AuthData | null {
  if (typeof window === "undefined") return null
  
  try {
    const storedData = localStorage.getItem(AUTH_DATA_KEY)
    if (storedData) {
      return JSON.parse(storedData)
    }
  } catch (error) {
    console.error("Failed to load auth data from localStorage:", error)
    // Clear corrupted data
    localStorage.removeItem(AUTH_DATA_KEY)
    localStorage.removeItem(COMPANY_DATA_KEY)
  }
  
  return null
}

/**
 * Load company data from localStorage
 */
export function loadCompanyDataFromStorage(): CompanyData | null {
  if (typeof window === "undefined") return null
  
  try {
    const storedData = localStorage.getItem(COMPANY_DATA_KEY)
    if (storedData) {
      return JSON.parse(storedData)
    }
  } catch (error) {
    console.error("Failed to load company data from localStorage:", error)
    // Clear corrupted data
    localStorage.removeItem(COMPANY_DATA_KEY)
  }
  
  return null
}

/**
 * Clear all authentication data from localStorage
 */
export function clearAuthDataFromStorage(): void {
  if (typeof window === "undefined") return
  
  localStorage.removeItem(AUTH_DATA_KEY)
  localStorage.removeItem(COMPANY_DATA_KEY)
}

/**
 * Check if user needs onboarding based on completion status
 */
export function needsOnboarding(completionStatus: any): boolean {
  if (!completionStatus) return true
  
  return (
    !completionStatus.profile_completed ||
    !completionStatus.shipping_configured ||
    !completionStatus.certificates_uploaded ||
    !completionStatus.first_product_added
  )
}

/**
 * Get the appropriate redirect path based on user status
 */
export function getRedirectPath(user: any, roles: string[], completionStatus: any): string {
  if (!user) {
    return "/login"
  }
  
  const isOwner = roles.includes("Owner")
  
  if (isOwner && needsOnboarding(completionStatus)) {
    return "/onboarding"
  }
  
  return "/dashboard"
}

/**
 * Format company data for form population
 */
export function formatCompanyDataForForm(companyData: CompanyData) {
  return {
    companyName: companyData.name || "",
    foundedYear: companyData.founded_year?.toString() || "",
    description: companyData.description || "",
    location: companyData.location || "",
    logo: companyData.logo || "",
    primaryContact: {
      fullName: companyData.owner?.name || companyData.contacts?.[0]?.email?.split('@')[0] || "",
      phone: companyData.contacts?.[0]?.phone || companyData.owner?.phone || "",
      email: companyData.contacts?.[0]?.email || companyData.owner?.email || "",
    },
    secondaryContact: {
      phone: companyData.contacts?.[1]?.phone || "",
      email: companyData.contacts?.[1]?.email || "",
      show: !!companyData.contacts?.[1],
    }
  }
}
