"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Eye, Package, TrendingUp, AlertTriangle } from "lucide-react"
import Link from "next/link"
import apiClient from "@/lib/axios"
import { toast } from "@/hooks/use-toast"

interface Product {
  id: string
  title: string
  sku: string
  category: string
  description: string
  status: "draft" | "active" | "archived"
  visibility: "private" | "public"
  moq: number
  leadTimeDays: number
  sampleAvailable: boolean
  samplePrice?: number
  specs: Array<{ key: string; value: string }>
  pricingTiers: Array<{ minQty: number; maxQty?: number; unitPrice: number }>
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface InventoryData {
  totalStock: number
  reservedStock: number
  availableStock: number
  warehouses: Array<{
    id: string
    name: string
    location: string
    stock: number
    reserved: number
  }>
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product>({
    id: "",
    title: "",
    sku: "",
    category: "",
    description: "",
    status: "draft",
    visibility: "private",
    moq: 0,
    leadTimeDays: 0,
    sampleAvailable: false,
    specs: [],
    pricingTiers: [],
    tags: [],
    createdAt: "",
    updatedAt: "",
  })
  const [inventory, setInventory] = useState<InventoryData>({
    totalStock: 0,
    reservedStock: 0,
    availableStock: 0,
    warehouses: [],
  })
  const [loading, setLoading] = useState(true)
  const [language] = useState<"en" | "ar">("en")

  const isArabic = language === "ar"

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [productRes, inventoryRes] = await Promise.all([
          apiClient.get(`/api/v1/supplier/products/${params.id}`),
          apiClient.get(`/api/v1/supplier/products/${params.id}/stock`),
        ])

        if (productRes.data) {
          setProduct(productRes.data)
        }
        if (inventoryRes.data) {
          setInventory(inventoryRes.data)
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        toast({
          title: isArabic ? "خطأ" : "Error",
          description: isArabic ? "فشل في تحميل المنتج" : "Failed to load product",
          variant: "destructive",
        })
        router.push("/dashboard/products")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id, router, isArabic])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-muted animate-pulse rounded" />
            <div className="h-32 bg-muted animate-pulse rounded" />
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">{isArabic ? "فشل في تحميل المنتج" : "Failed to load product"}</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isArabic ? "العودة" : "Back"}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{product.title}</h1>
            <p className="text-muted-foreground">SKU: {product.sku}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="bg-transparent">
            <Eye className="h-4 w-4 mr-2" />
            {isArabic ? "معاينة" : "Preview"}
          </Button>
          <Link href={`/dashboard/products/${product.id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              {isArabic ? "تعديل" : "Edit"}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {isArabic ? "معلومات المنتج" : "Product Information"}
                <div className="flex gap-2">
                  <Badge className={getStatusColor(product.status)}>
                    {isArabic
                      ? product.status === "active"
                        ? "نشط"
                        : product.status === "draft"
                          ? "مسودة"
                          : "مؤرشف"
                      : product.status}
                  </Badge>
                  <Badge variant="outline">
                    {isArabic ? (product.visibility === "public" ? "عام" : "خاص") : product.visibility}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">{isArabic ? "الوصف" : "Description"}</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">{isArabic ? "الفئة" : "Category"}</h4>
                  <p className="text-muted-foreground">{product.category}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">{isArabic ? "الحد الأدنى للطلب" : "Minimum Order Quantity"}</h4>
                  <p className="text-muted-foreground">
                    {product.moq.toLocaleString()} {isArabic ? "قطعة" : "pieces"}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">{isArabic ? "مدة التسليم" : "Lead Time"}</h4>
                  <p className="text-muted-foreground">
                    {product.leadTimeDays} {isArabic ? "يوم" : "days"}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">{isArabic ? "العينة" : "Sample"}</h4>
                  <p className="text-muted-foreground">
                    {product.sampleAvailable
                      ? `${isArabic ? "متاحة" : "Available"} ${product.samplePrice ? `- $${product.samplePrice}` : ""}`
                      : isArabic
                        ? "غير متاحة"
                        : "Not Available"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          {product.specs && product.specs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "المواصفات" : "Specifications"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {product.specs.map((spec, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                      <span className="font-medium">{spec.key}</span>
                      <span className="text-muted-foreground">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pricing Tiers */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "شرائح التسعير" : "Pricing Tiers"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(product.pricingTiers || []).map((tier, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <span className="font-medium">
                        {tier.minQty.toLocaleString()}
                        {tier.maxQty ? ` - ${tier.maxQty.toLocaleString()}` : "+"} {isArabic ? "قطعة" : "pieces"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-primary">${tier.unitPrice.toFixed(2)}</span>
                      <span className="text-muted-foreground text-sm ml-1">{isArabic ? "للقطعة" : "per piece"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Inventory Status */}
          {inventory && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {isArabic ? "حالة المخزون" : "Inventory Status"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isArabic ? "إجمالي المخزون" : "Total Stock"}</span>
                    <span className="font-medium">{inventory.totalStock.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isArabic ? "محجوز" : "Reserved"}</span>
                    <span className="font-medium text-yellow-600">{inventory.reservedStock.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isArabic ? "متاح" : "Available"}</span>
                    <span className="font-medium text-green-600">{inventory.availableStock.toLocaleString()}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">{isArabic ? "المستودعات" : "Warehouses"}</h4>
                  <div className="space-y-2">
                    {(inventory.warehouses || []).map((warehouse) => (
                      <div key={warehouse.id} className="p-2 bg-muted/50 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{warehouse.name}</p>
                            <p className="text-xs text-muted-foreground">{warehouse.location}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{warehouse.stock.toLocaleString()}</p>
                            {warehouse.reserved > 0 && (
                              <p className="text-xs text-yellow-600">
                                {warehouse.reserved.toLocaleString()} {isArabic ? "محجوز" : "reserved"}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {inventory.availableStock < product.moq && (
                  <div className="flex items-center gap-2 p-2 bg-yellow-50 text-yellow-800 rounded">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">{isArabic ? "المخزون أقل من الحد الأدنى للطلب" : "Stock below MOQ"}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "العلامات" : "Tags"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "إجراءات سريعة" : "Quick Actions"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <TrendingUp className="h-4 w-4 mr-2" />
                {isArabic ? "عرض الإحصائيات" : "View Analytics"}
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Package className="h-4 w-4 mr-2" />
                {isArabic ? "تحديث المخزون" : "Update Stock"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
