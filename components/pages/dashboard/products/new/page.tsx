"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n/context"
import { toast } from "sonner"
import { createProduct } from "@/src/services/products-api"
import { ProductForm } from "../components/ProductForm"

export default function NewProductPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    
    // Show loading toast
    const loadingToast = toast.loading("Creating product...", {
      description: "Please wait while we save your product"
    })
    
    try {
      const newProduct = await createProduct(formData)
      
      // Dismiss loading toast
      toast.dismiss(loadingToast)
      
      // Show success toast
      toast.success("Product Created Successfully! 🎉", {
        description: `${newProduct.name || "Your product"} has been added to your catalog`,
        duration: 5000
      })
      
      // Delay navigation to show toast
      setTimeout(() => {
        router.push(`/dashboard/products`)
      }, 1500)
    } catch (error: any) {
      // Dismiss loading toast
      toast.dismiss(loadingToast)
      console.error('Product creation error:', error)
      console.error('Response data:', error.response?.data)
      console.error('Response status:', error.response?.status)
      
      // Extract validation errors from 422 response
      if (error.response?.status === 422) {
        const responseData = error.response.data
        
        // Check for Laravel validation errors structure
        if (responseData?.errors) {
          const validationErrors = responseData.errors
          const errorCount = Object.keys(validationErrors).length
          const errorMessages = Object.entries(validationErrors)
            .slice(0, 5) // Show max 5 errors
            .map(([field, messages]: [string, any]) => {
              const messageArray = Array.isArray(messages) ? messages : [messages]
              return `• ${field.replace(/\./g, ' → ')}: ${messageArray[0]}`
            })
            .join('\n')
          
          console.log('Validation errors:', validationErrors)
          
          toast.error(`Validation Failed (${errorCount} ${errorCount === 1 ? 'error' : 'errors'})`, {
            description: errorMessages + (errorCount > 5 ? '\n... and more' : ''),
            duration: 10000
          })
        } else if (responseData?.message) {
          toast.error("Validation Error", {
            description: responseData.message,
            duration: 8000
          })
        } else {
          toast.error("Validation Error", {
            description: "The server rejected the request. Check console for details.",
            duration: 8000
          })
        }
      } else if (error.response?.status === 401) {
        toast.error("Authentication Required", {
          description: "Please log in to continue"
        })
      } else if (error.response?.status === 403) {
        toast.error("Permission Denied", {
          description: "You don't have permission to perform this action"
        })
      } else if (error.response?.status >= 500) {
        toast.error("Server Error", {
          description: "Something went wrong on our end. Please try again later."
        })
      } else {
        const errorMsg = error.response?.data?.message || error.message || "Failed to create product"
        toast.error("Error Creating Product", {
          description: errorMsg
        })
      }
      
      // Re-throwing the error is important if the form needs to react to it
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.back}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t.addNewProduct}</h1>
            <p className="text-muted-foreground">{t.createNewProductInCatalog}</p>
          </div>
        </div>
        <Button form="product-form" type="submit" disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? t.saving : t.saveProduct}
        </Button>
      </div>

      <ProductForm onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
