"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Plus, X, DollarSign } from "lucide-react"
import Link from "next/link"
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

const MOCK_PRODUCT_DATA = {
  "PROD-001": {
    id: "PROD-001",
    title: "Premium Steel Pipes - Industrial Grade",
    sku: "PROD-001",
    category: "Construction Materials",
    description:
      "High-quality industrial grade steel pipes suitable for construction and infrastructure projects. Made from premium carbon steel with excellent durability and corrosion resistance.",
    status: "active" as const,
    visibility: "public" as const,
    moq: 100,
    leadTimeDays: 15,
    sampleAvailable: true,
    samplePrice: 25.0,
    specs: [
      { key: "Material", value: "Carbon Steel" },
      { key: "Diameter", value: "50mm - 200mm" },
      { key: "Wall Thickness", value: "3mm - 8mm" },
      { key: "Length", value: "6m - 12m" },
      { key: "Standard", value: "ASTM A53" },
      { key: "Surface Treatment", value: "Galvanized" },
    ],
    pricingTiers: [
      { minQty: 100, maxQty: 499, unitPrice: 28.5 },
      { minQty: 500, maxQty: 999, unitPrice: 26.75 },
      { minQty: 1000, unitPrice: 24.99 },
    ],
    tags: ["steel", "construction", "industrial", "pipes"],
    createdAt: "2024-10-15T08:30:00Z",
    updatedAt: "2024-11-20T14:22:00Z",
  },
  "PROD-002": {
    id: "PROD-002",
    title: "Organic Cotton T-Shirts - Wholesale",
    sku: "PROD-002",
    category: "Textiles & Apparel",
    description:
      "Premium organic cotton t-shirts perfect for wholesale and retail. Made from 100% certified organic cotton with superior comfort and durability.",
    status: "active" as const,
    visibility: "public" as const,
    moq: 500,
    leadTimeDays: 20,
    sampleAvailable: true,
    samplePrice: 12.0,
    specs: [
      { key: "Material", value: "100% Organic Cotton" },
      { key: "Weight", value: "180 GSM" },
      { key: "Sizes", value: "XS to XXL" },
      { key: "Colors", value: "White, Black, Navy, Gray" },
      { key: "Certification", value: "GOTS Certified" },
      { key: "Care", value: "Machine Washable" },
    ],
    pricingTiers: [
      { minQty: 500, maxQty: 999, unitPrice: 9.5 },
      { minQty: 1000, maxQty: 2499, unitPrice: 8.75 },
      { minQty: 2500, unitPrice: 7.99 },
    ],
    tags: ["organic", "cotton", "apparel", "wholesale"],
    createdAt: "2024-10-20T10:15:00Z",
    updatedAt: "2024-11-18T16:45:00Z",
  },
}

export default function ProductEditPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [language] = useState<"en" | "ar">("en")
  const [newSpec, setNewSpec] = useState({ key: "", value: "" })
  const [newTag, setNewTag] = useState("")
  const [newTier, setNewTier] = useState({ minQty: "", maxQty: "", unitPrice: "" })

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
    samplePrice: 0,
    specs: [],
    pricingTiers: [],
    tags: [],
    createdAt: "",
    updatedAt: "",
  })

  const isArabic = language === "ar"

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        const mockProduct = MOCK_PRODUCT_DATA[params.id as keyof typeof MOCK_PRODUCT_DATA]
        if (mockProduct) {
          setProduct(mockProduct)
        } else {
          toast({
            title: isArabic ? "خطأ" : "Error",
            description: isArabic ? "لم يتم العثور على المنتج" : "Product not found",
            variant: "destructive",
          })
          router.push("/dashboard/products")
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

  const handleSave = async () => {
    setSaving(true)
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: isArabic ? "تم الحفظ" : "Saved",
        description: isArabic ? "تم حفظ المنتج بنجاح" : "Product saved successfully",
      })

      router.push(`/dashboard/products/${product.id}`)
    } catch (error) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic ? "فشل في حفظ المنتج" : "Failed to save product",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const addSpec = () => {
    if (newSpec.key && newSpec.value) {
      setProduct((prev) => ({
        ...prev,
        specs: [...prev.specs, { ...newSpec }],
      }))
      setNewSpec({ key: "", value: "" })
    }
  }

  const removeSpec = (index: number) => {
    setProduct((prev) => ({
      ...prev,
      specs: prev.specs.filter((_, i) => i !== index),
    }))
  }

  const addTag = () => {
    if (newTag && !product.tags.includes(newTag)) {
      setProduct((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setProduct((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const addPricingTier = () => {
    if (newTier.minQty && newTier.unitPrice) {
      const tier = {
        minQty: Number.parseInt(newTier.minQty),
        maxQty: newTier.maxQty ? Number.parseInt(newTier.maxQty) : undefined,
        unitPrice: Number.parseFloat(newTier.unitPrice),
      }
      setProduct((prev) => ({
        ...prev,
        pricingTiers: [...prev.pricingTiers, tier].sort((a, b) => a.minQty - b.minQty),
      }))
      setNewTier({ minQty: "", maxQty: "", unitPrice: "" })
    }
  }

  const removePricingTier = (index: number) => {
    setProduct((prev) => ({
      ...prev,
      pricingTiers: prev.pricingTiers.filter((_, i) => i !== index),
    }))
  }

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

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/products/${product.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isArabic ? "العودة" : "Back"}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{isArabic ? "تعديل المنتج" : "Edit Product"}</h1>
            <p className="text-muted-foreground">SKU: {product.sku}</p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? (isArabic ? "جاري الحفظ..." : "Saving...") : isArabic ? "حفظ" : "Save"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "المعلومات الأساسية" : "Basic Information"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">{isArabic ? "اسم المنتج" : "Product Title"} *</Label>
                  <Input
                    id="title"
                    value={product.title}
                    onChange={(e) => setProduct((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder={isArabic ? "أدخل اسم المنتج" : "Enter product title"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">{isArabic ? "رمز المنتج" : "SKU"} *</Label>
                  <Input
                    id="sku"
                    value={product.sku}
                    onChange={(e) => setProduct((prev) => ({ ...prev, sku: e.target.value }))}
                    placeholder={isArabic ? "أدخل رمز المنتج" : "Enter SKU"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{isArabic ? "الوصف" : "Description"}</Label>
                <Textarea
                  id="description"
                  value={product.description}
                  onChange={(e) => setProduct((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder={isArabic ? "أدخل وصف المنتج" : "Enter product description"}
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">{isArabic ? "الفئة" : "Category"}</Label>
                  <Select
                    value={product.category}
                    onValueChange={(value) => setProduct((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isArabic ? "اختر الفئة" : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Construction Materials">Construction Materials</SelectItem>
                      <SelectItem value="Textiles & Apparel">Textiles & Apparel</SelectItem>
                      <SelectItem value="Electronics & Electrical">Electronics & Electrical</SelectItem>
                      <SelectItem value="Machinery & Equipment">Machinery & Equipment</SelectItem>
                      <SelectItem value="Automotive Parts">Automotive Parts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">{isArabic ? "الحالة" : "Status"}</Label>
                  <Select
                    value={product.status}
                    onValueChange={(value: "draft" | "active" | "archived") =>
                      setProduct((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">{isArabic ? "مسودة" : "Draft"}</SelectItem>
                      <SelectItem value="active">{isArabic ? "نشط" : "Active"}</SelectItem>
                      <SelectItem value="archived">{isArabic ? "مؤرشف" : "Archived"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commercial Terms */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "الشروط التجارية" : "Commercial Terms"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="moq">{isArabic ? "الحد الأدنى للطلب" : "MOQ"}</Label>
                  <Input
                    id="moq"
                    type="number"
                    value={product.moq}
                    onChange={(e) => setProduct((prev) => ({ ...prev, moq: Number.parseInt(e.target.value) || 0 }))}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leadTime">{isArabic ? "مدة التسليم (أيام)" : "Lead Time (Days)"}</Label>
                  <Input
                    id="leadTime"
                    type="number"
                    value={product.leadTimeDays}
                    onChange={(e) =>
                      setProduct((prev) => ({ ...prev, leadTimeDays: Number.parseInt(e.target.value) || 0 }))
                    }
                    placeholder="15"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="samplePrice">{isArabic ? "سعر العينة" : "Sample Price"}</Label>
                  <Input
                    id="samplePrice"
                    type="number"
                    step="0.01"
                    value={product.samplePrice || ""}
                    onChange={(e) =>
                      setProduct((prev) => ({ ...prev, samplePrice: Number.parseFloat(e.target.value) || undefined }))
                    }
                    placeholder="25.00"
                    disabled={!product.sampleAvailable}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="sampleAvailable"
                  checked={product.sampleAvailable}
                  onCheckedChange={(checked) => setProduct((prev) => ({ ...prev, sampleAvailable: checked }))}
                />
                <Label htmlFor="sampleAvailable">{isArabic ? "العينة متاحة" : "Sample Available"}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="visibility"
                  checked={product.visibility === "public"}
                  onCheckedChange={(checked) =>
                    setProduct((prev) => ({ ...prev, visibility: checked ? "public" : "private" }))
                  }
                />
                <Label htmlFor="visibility">{isArabic ? "منتج عام" : "Public Product"}</Label>
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "المواصفات" : "Specifications"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {product.specs.map((spec, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <span className="font-medium flex-1">{spec.key}:</span>
                    <span className="text-muted-foreground flex-1">{spec.value}</span>
                    <Button variant="ghost" size="sm" onClick={() => removeSpec(index)} className="h-8 w-8 p-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder={isArabic ? "المفتاح" : "Key"}
                  value={newSpec.key}
                  onChange={(e) => setNewSpec((prev) => ({ ...prev, key: e.target.value }))}
                />
                <Input
                  placeholder={isArabic ? "القيمة" : "Value"}
                  value={newSpec.value}
                  onChange={(e) => setNewSpec((prev) => ({ ...prev, value: e.target.value }))}
                />
                <Button onClick={addSpec} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Tiers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {isArabic ? "شرائح التسعير" : "Pricing Tiers"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {product.pricingTiers.map((tier, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <div>
                      <span className="font-medium">
                        {tier.minQty.toLocaleString()}
                        {tier.maxQty ? ` - ${tier.maxQty.toLocaleString()}` : "+"} {isArabic ? "قطعة" : "pieces"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">${tier.unitPrice.toFixed(2)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePricingTier(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-2 md:grid-cols-4">
                <Input
                  type="number"
                  placeholder={isArabic ? "الحد الأدنى" : "Min Qty"}
                  value={newTier.minQty}
                  onChange={(e) => setNewTier((prev) => ({ ...prev, minQty: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder={isArabic ? "الحد الأقصى" : "Max Qty"}
                  value={newTier.maxQty}
                  onChange={(e) => setNewTier((prev) => ({ ...prev, maxQty: e.target.value }))}
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder={isArabic ? "السعر" : "Unit Price"}
                  value={newTier.unitPrice}
                  onChange={(e) => setNewTier((prev) => ({ ...prev, unitPrice: e.target.value }))}
                />
                <Button onClick={addPricingTier} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {isArabic ? "إضافة" : "Add"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "العلامات" : "Tags"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTag(tag)}
                      className="h-4 w-4 p-0 hover:bg-transparent"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder={isArabic ? "إضافة علامة" : "Add tag"}
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                />
                <Button onClick={addTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Product Status */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "حالة المنتج" : "Product Status"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isArabic ? "الحالة" : "Status"}</span>
                <Badge
                  className={
                    product.status === "active"
                      ? "bg-green-100 text-green-800"
                      : product.status === "draft"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                  }
                >
                  {isArabic
                    ? product.status === "active"
                      ? "نشط"
                      : product.status === "draft"
                        ? "مسودة"
                        : "مؤرشف"
                    : product.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isArabic ? "الرؤية" : "Visibility"}</span>
                <Badge variant="outline">
                  {isArabic ? (product.visibility === "public" ? "عام" : "خاص") : product.visibility}
                </Badge>
              </div>
              <Separator />
              <div className="text-sm text-muted-foreground">
                <p>{isArabic ? "آخر تحديث:" : "Last updated:"}</p>
                <p>{new Date(product.updatedAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
