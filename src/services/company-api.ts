import apiClient from "@/lib/axios"
import { Company } from "@/src/contexts/auth-context"

export interface CompanyUpdateData {
  name?: string
  description?: string
  founded_year?: number
  location?: string
  logo?: File
  remove_logo?: boolean // Flag to indicate logo should be removed
  contacts?: Array<{
    phone?: string
    email?: string
    is_primary?: number
  }>
}

export interface CompanyApiResponse {
  data: Company
  message?: string
}

export class CompanyApiService {
  /**
   * Fetch company data from the backend
   */
  static async getCompany(): Promise<Company> {
    try {
      const response = await apiClient.get<CompanyApiResponse>("/v1/company")
      return response.data.data
    } catch (error: any) {
      console.error("Failed to fetch company data:", error)
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch company data")
    }
  }

  /**
   * Update company data
   */
  static async updateCompany(data: CompanyUpdateData): Promise<Company> {
    try {
      const formData = new FormData()
      
      // Add method override for PUT request
      formData.append("_method", "PUT")
      
      // Add basic company information
      if (data.name) {
        formData.append("name", data.name)
      }
      if (data.description) {
        formData.append("description", data.description)
      }
      if (data.founded_year) {
        formData.append("founded_year", data.founded_year.toString())
      }
      if (data.location) {
        formData.append("location", data.location)
      }
      
      // Add logo if provided
      if (data.logo) {
        formData.append("logo", data.logo)
      }
      
      // Add logo removal flag if needed
      if (data.remove_logo) {
        formData.append("remove_logo", "1")
      }
      
      // Add contacts
      if (data.contacts) {
        data.contacts.forEach((contact, index) => {
          if (contact.phone) {
            formData.append(`contacts[${index}][phone]`, contact.phone)
          }
          if (contact.email) {
            formData.append(`contacts[${index}][email]`, contact.email)
          }
          if (contact.is_primary !== undefined) {
            formData.append(`contacts[${index}][is_primary]`, contact.is_primary.toString())
          }
        })
      }

      const response = await apiClient.post<CompanyApiResponse>(
        "/v1/company/update", 
        formData, 
        { 
          headers: { 
            "Content-Type": "multipart/form-data" 
          } 
        }
      )
      
      return response.data.data
    } catch (error: any) {
      console.error("Failed to update company data:", error)
      throw new Error(error.response?.data?.message || error.message || "Failed to update company data")
    }
  }

  /**
   * Check if company exists and is active
   */
  static async checkCompanyStatus(): Promise<{ exists: boolean; isActive: boolean }> {
    try {
      const company = await this.getCompany()
      return {
        exists: !!company,
        isActive: company?.is_active || false
      }
    } catch (error) {
      return {
        exists: false,
        isActive: false
      }
    }
  }

  /**
   * Get company completion status
   */
  static async getCompletionStatus(): Promise<{
    profile_completed: boolean
    warehouse_setup?: boolean
    certificates_uploaded: boolean
    first_product_added: boolean
    shipping_configured?: boolean // Deprecated - kept for backward compatibility
  }> {
    try {
      const company = await this.getCompany()
      
      // Determine completion status based on company data
      return {
        profile_completed: !!(company?.name && company?.description && company?.contacts?.length),
        warehouse_setup: false, // This would need to be determined based on warehouse setup
        certificates_uploaded: false, // This would need to be determined based on uploaded certificates
        first_product_added: false, // This would need to be determined based on products
        shipping_configured: false, // Kept for backward compatibility
      }
    } catch (error) {
      return {
        profile_completed: false,
        warehouse_setup: false,
        certificates_uploaded: false,
        first_product_added: false,
        shipping_configured: false,
      }
    }
  }
}

// Export convenience functions
export const companyApi = {
  get: CompanyApiService.getCompany,
  update: CompanyApiService.updateCompany,
  checkStatus: CompanyApiService.checkCompanyStatus,
  getCompletionStatus: CompanyApiService.getCompletionStatus,
}
