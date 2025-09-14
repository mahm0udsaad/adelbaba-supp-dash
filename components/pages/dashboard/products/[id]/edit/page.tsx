"use client"

import { useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n/context"
import { toast } from "@/components/ui/use-toast"
import { getProduct, updateProduct } from "@/services/products-api"
import { ProductForm } from "../components/ProductForm"
import { useApiWithFallback } from "@/hooks/useApiWithFallback"
import { ProductDetail } from "@/services/types/product-types"

export default function EditProductPageImpl() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)

  const fetcher = useCallback(() => getProduct(id), [id])
  const { data: product, loading: productLoading } = useApiWithFallback<ProductDetail | null>({
      fetcher,
      fallback: async () => null, // Let the form handle the null case
      deps: [id]
  });

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    try {
      await updateProduct(id, formData)
      toast({ title: t.productUpdated, description: t.productUpdatedSuccess })
      router.push(`/dashboard/products`)
    } catch (error) {
      console.error(error)
      toast({ title: t.error, description: t.productUpdateFailed, variant: "destructive" })
      throw error
    } finally {
      setLoading(false)
    }
  }

  if (productLoading) {
      return <div>Loading product...</div> // Or a skeleton loader
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
            <h1 className="text-2xl font-bold text-foreground">{t.editProduct}</h1>
            <p className="text-muted-foreground">{product?.name}</p>
          </div>
        </div>
        <Button form="product-form" type="submit" disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? t.saving : t.saveChanges}
        </Button>
      </div>

      <ProductForm onSubmit={handleSubmit} loading={loading} initialData={product} />
    </div>
  )
}