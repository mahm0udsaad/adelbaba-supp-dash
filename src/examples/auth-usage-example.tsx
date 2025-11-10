/**
 * Example component showing how to use the new authentication system
 * This file demonstrates the proper usage patterns for the auth context and company API
 */

"use client"

import React, { useEffect } from "react"
import { useAuth, useCompany } from "@/src/contexts/auth-context"
import { useCompany as useCompanyHook } from "@/src/hooks/use-company"
import { formatCompanyDataForForm } from "@/src/utils/auth-utils"

export function AuthUsageExample() {
  // Using the auth context
  const { authData, isLoading, error, fetchCompanyData, updateAuthData } = useAuth()
  
  // Using the company hook
  const { company, isLoading: companyLoading, fetchCompany, updateCompany } = useCompanyHook()

  // Example: Load company data on component mount
  useEffect(() => {
    if (authData.token && !company) {
      fetchCompany()
    }
  }, [authData.token, company, fetchCompany])

  // Example: Update company data
  const handleUpdateCompany = async () => {
    try {
      await updateCompany({
        name: "Updated Company Name",
        description: "Updated description",
        contacts: [
          {
            phone: "+1234567890",
            email: "contact@company.com",
            is_primary: 1,
          }
        ]
      })
      console.log("Company updated successfully!")
    } catch (error) {
      console.error("Failed to update company:", error)
    }
  }

  // Example: Format company data for form
  const formData = company ? formatCompanyDataForForm(company) : null

  if (isLoading || companyLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Authentication Data</h2>
      
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-semibold">User Info:</h3>
        <p>Name: {authData.user?.name}</p>
        <p>Email: {authData.user?.email}</p>
        <p>Roles: {authData.roles.join(", ")}</p>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-semibold">Company Info:</h3>
        {company ? (
          <>
            <p>Name: {company.name}</p>
            <p>Description: {company.description}</p>
            <p>Founded Year: {company.founded_year}</p>
            <p>Location: {company.location}</p>
            <p>Contacts: {company.contacts.length}</p>
          </>
        ) : (
          <p>No company data available</p>
        )}
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-semibold">Completion Status:</h3>
        {authData.completionStatus ? (
          <>
            <p>Profile Completed: {authData.completionStatus.profile_completed ? "Yes" : "No"}</p>
            <p>Warehouse Setup: {authData.completionStatus.warehouse_setup ? "Yes" : "No"}</p>
            <p>Certificates Uploaded: {authData.completionStatus.certificates_uploaded ? "Yes" : "No"}</p>
            <p>First Product Added: {authData.completionStatus.first_product_added ? "Yes" : "No"}</p>
          </>
        ) : (
          <p>No completion status available</p>
        )}
      </div>

      <button 
        onClick={handleUpdateCompany}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Update Company
      </button>

      {formData && (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold">Formatted Data for Forms:</h3>
          <pre className="text-sm">{JSON.stringify(formData, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default AuthUsageExample
