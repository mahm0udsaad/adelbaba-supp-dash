import { useState, useCallback } from "react"
import { useAuth } from "@/src/contexts/auth-context"
import { CompanyApiService, CompanyUpdateData } from "@/src/services/company-api"

export interface UseCompanyResult {
  company: any | null
  isLoading: boolean
  error: string | null
  fetchCompany: () => Promise<void>
  updateCompany: (data: CompanyUpdateData) => Promise<void>
  refreshCompany: () => Promise<void>
}

export function useCompany(): UseCompanyResult {
  const { authData, updateAuthData, isLoading: authLoading, error: authError } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCompany = useCallback(async () => {
    if (!authData.token) {
      setError("No authentication token available")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const companyData = await CompanyApiService.getCompany()
      updateAuthData({ company: companyData })
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch company data"
      setError(errorMessage)
      console.error("Failed to fetch company data:", err)
    } finally {
      setIsLoading(false)
    }
  }, [authData.token, updateAuthData])

  const updateCompany = useCallback(async (data: CompanyUpdateData) => {
    if (!authData.token) {
      setError("No authentication token available")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const updatedCompany = await CompanyApiService.updateCompany(data)
      updateAuthData({ company: updatedCompany })
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update company data"
      setError(errorMessage)
      console.error("Failed to update company data:", err)
      throw err // Re-throw to allow component to handle the error
    } finally {
      setIsLoading(false)
    }
  }, [authData.token, updateAuthData])

  const refreshCompany = useCallback(async () => {
    await fetchCompany()
  }, [fetchCompany])

  return {
    company: authData.company,
    isLoading: isLoading || authLoading,
    error: error || authError,
    fetchCompany,
    updateCompany,
    refreshCompany,
  }
}
