"use client"

import { useCallback, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Eye, Package, DollarSign, CheckCircle, XCircle, Trash2 } from "lucide-react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n/context"
import { useApiWithFallback } from "@/hooks/useApiWithFallback"
import { getProduct, deleteProduct } from "@/src/services/products-api"
import { ProductDetail, ProductListItem } from "@/src//services/types/product-types"
import { DeleteConfirmationDialog } from "../components/DeleteConfirmationDialog"
import { toast } from "@/components/ui/use-toast"

// Placeholder sub-components for displaying complex data. These should be in their own files.

const MediaGallery = ({ media }: { media: ProductDetail["media"] }) => {
  const { t } = useI18n()
  if (!media || media.length === 0) return <p>{t.noMediaAvailable}</p>
  return (
    <div className="grid grid-cols-3 gap-4">
      {media.map(m => (
        <img key={m.id} src={m.url} alt={m.name} className="rounded-lg object-cover h-40 w-full" />
      ))}
    </div>
  )
}

const PricingDisplay = ({ product }: { product: ProductDetail }) => {
  const { t } = useI18n()
  switch (product.price_type) {
    case "range":
      return <p className="text-2xl font-bold text-primary">{product.shown_price}</p>
    case "tiered":
      return (
        <div>
          {product.tieredPrices.map((tier, i) => (
            <div key={i} className="flex justify-between">
              <span>{`>= ${tier.min_quantity} ${product.unit}s`}</span>
              <span className="font-bold">${tier.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )
    case "sku":
      return <p>{t.seeSkuPricing}</p> // Pricing is shown in the SKU list
    default:
      return <p className="text-muted-foreground">{t.pricingNotAvailable}</p>
  }
}

const SkuList = ({ skus }: { skus: ProductDetail["skus"] }) => {
  const { t } = useI18n()
  if (!skus || skus.length === 0) return <p>{t.noSkusAvailable}</p>
  return (
    <div className="space-y-4">
      {skus.map(sku => (
        <div key={sku.id} className="p-3 bg-muted/50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-bold">{sku.code}</span>
            <span className="text-lg text-primary font-bold">${sku.price}</span>
          </div>
          <div className="text-sm text-muted-foreground">{t.stock}: {sku.inventory}</div>
          <div className="flex gap-2 mt-2">
            {sku.attributes.map((attr, i) => (
              <Badge key={i} variant="secondary">{attr.name}: {attr.value}</Badge>
            ))}
          </div>
          <div className="mt-3">
            <Link href={`/dashboard/inventory?sku_id=${sku.id}`}>
              <Button size="sm" variant="outline" className="bg-transparent">{t.operate || "Operate"}</Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useI18n()
  const id = params.id as string
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const fetcher = useCallback(() => getProduct(id), [id])
  const fallback = useCallback(async () => {
    // In a real app, you might have a fallback or redirect.
    toast({ title: t.error, description: t.productLoadFailed, variant: "destructive" })
    router.push("/dashboard/products")
    return null
  }, [id, router, t])

  const { data: product, loading } = useApiWithFallback<ProductDetail | null>({
    fetcher,
    fallback,
    deps: [id],
  })

  const handleDelete = async () => {
    if (!product) return;
    try {
      await deleteProduct(product.id)
      toast({ title: t.productDeleted, description: t.productDeletedSuccess })
      router.push("/dashboard/products")
    } catch (error) {
      toast({ title: t.error, description: t.productDeleteFailed, variant: "destructive" })
    }
  }

  if (loading || !product) {
    return (
      <div className="p-4 space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/2" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-muted rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/products">
              <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />{t.back}</Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
              <p className="text-muted-foreground">{product.category.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/products/${product.id}/edit`}>
              <Button><Edit className="h-4 w-4 mr-2" />{t.edit}</Button>
            </Link>
            <Link href={`/dashboard/inventory?sku_id=${product.skus?.[0]?.id ?? ''}`}>
              <Button variant="outline" className="bg-transparent"><Eye className="h-4 w-4 mr-2" />{t.viewInventory || "View inventory levels"}</Button>
            </Link>
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              {t.delete}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>{t.media}</CardTitle></CardHeader>
              <CardContent><MediaGallery media={product.media} /></CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>{t.description}</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground">{product.description}</p></CardContent>
            </Card>

            {product.price_type === 'sku' && (
               <Card>
                  <CardHeader><CardTitle>{t.skus}</CardTitle></CardHeader>
                  <CardContent><SkuList skus={product.skus} /></CardContent>
                </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>{t.status}</CardTitle></CardHeader>
              <CardContent>
                <Badge variant={product.is_active ? "default" : "destructive"} className="flex items-center gap-1">
                  {product.is_active ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {product.is_active ? t.active : t.inactive}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>{t.pricing}</CardTitle></CardHeader>
              <CardContent><PricingDisplay product={product} /></CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>{t.details}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between"><span>{t.moq}</span><span className="font-bold">{product.moq} {product.unit}</span></div>
                <div className="flex justify-between"><span>{t.inventory}</span><span className="font-bold">{product.inventory}</span></div>
                <div className="flex justify-between"><span>{t.readyToShip}</span><span className="font-bold">{product.is_rts ? t.yes : t.no}</span></div>
                <div className="flex justify-between"><span>{t.reviews}</span><span className="font-bold">{product.reviews_count}</span></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <DeleteConfirmationDialog 
        isOpen={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen} 
        onConfirm={handleDelete} 
      />
    </>
  )
}
