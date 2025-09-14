"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n/context"
import { toast } from "@/components/ui/use-toast"
import { createProduct } from "@/src/services/products-api"
import { ProductForm } from "../components/ProductForm"

export default function NewProductPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    try {
      const newProduct = await createProduct(formData)
      toast({ title: t.productCreated, description: t.productCreatedSuccess })
      router.push(`/dashboard/products`)
    } catch (error) {
      console.error(error)
      toast({ title: t.error, description: t.productCreateFailed, variant: "destructive" })
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
