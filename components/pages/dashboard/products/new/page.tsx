"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Plus, X, Save, Eye } from "lucide-react"
import Link from "next/link"
import apiClient from "@/lib/axios"
import { toast } from "@/hooks/use-toast"

interface PricingTier {
  minQty: number
  maxQty?: number
  unitPrice: number
}

interface Specification {
  key: string
  value: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [language] = useState<"en" | "ar">("en")

  const [formData, setFormData] = useState({
    title: "",
    sku: "",
    categoryId: "",
    description: "",
    moq: "",
    sampleAvailable: false,
    samplePrice: "",
    status: "draft",
    visibility: "private",
    leadTimeDays: "30",
  })

  const [specs, setSpecs] = useState<Specification[]>([{ key: "", value: "" }])
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([{ minQty: 0, unitPrice: 0 }])
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  const isArabic = language === "ar"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const productData = {
        ...formData,
        moq: Number.parseInt(formData.moq),
        samplePrice: formData.samplePrice ? Number.parseFloat(formData.samplePrice) : undefined,
        leadTimeDays: Number.parseInt(formData.leadTimeDays),
        specs: specs.filter((spec) => spec.key && spec.value),
        pricingTiers: pricingTiers.filter((tier) => tier.minQty > 0 && tier.unitPrice > 0),
        tags,
      }

      await apiClient.post("/api/v1/supplier/products", productData)

      toast({
        title: isArabic ? "تم إنشاء المنتج" : "Product Created",
        description: isArabic ? "تم إنشاء المنتج بنجاح" : "Product has been created successfully",
      })

      router.push("/dashboard/products")
    } catch (error) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic ? "فشل في إنشاء المنتج" : "Failed to create product",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addSpecification = () => {
    setSpecs([...specs, { key: "", value: "" }])
  }

  const removeSpecification = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index))
  }

  const updateSpecification = (index: number, field: "key" | "value", value: string) => {
    const updatedSpecs = [...specs]
    updatedSpecs[index][field] = value
    setSpecs(updatedSpecs)
  }

  const addPricingTier = () => {
    setPricingTiers([...pricingTiers, { minQty: 0, unitPrice: 0 }])
  }

  const removePricingTier = (index: number) => {
    setPricingTiers(pricingTiers.filter((_, i) => i !== index))
  }

  const updatePricingTier = (index: number, field: keyof PricingTier, value: number) => {
    const updatedTiers = [...pricingTiers]
    updatedTiers[index][field] = value
    setPricingTiers(updatedTiers)
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
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
            <h1 className="text-2xl font-bold text-foreground">{isArabic ? "إضافة منتج جديد" : "Add New Product"}</h1>
            <p className="text-muted-foreground">
              {isArabic ? "أنشئ منتج جديد في الكتالوج" : "Create a new product in your catalog"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" type="button" className="bg-transparent">
            <Eye className="h-4 w-4 mr-2" />
            {isArabic ? "معاينة" : "Preview"}
          </Button>
          <Button form="product-form" type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? (isArabic ? "جاري الحفظ..." : "Saving...") : isArabic ? "حفظ المنتج" : "Save Product"}
          </Button>
        </div>
      </div>

      <form id="product-form" onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "المعلومات الأساسية" : "Basic Information"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{isArabic ? "اسم المنتج" : "Product Title"} *</Label>
                <Input
                  id="title"
                  placeholder={isArabic ? "أدخل اسم المنتج" : "Enter product title"}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sku">{isArabic ? "رمز المنتج (SKU)" : "SKU"} *</Label>
                  <Input
                    id="sku"
                    placeholder={isArabic ? "مثال: PROD-001" : "e.g., PROD-001"}
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">{isArabic ? "الفئة" : "Category"} *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isArabic ? "اختر الفئة" : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">{isArabic ? "إلكترونيات" : "Electronics"}</SelectItem>
                      <SelectItem value="textiles">{isArabic ? "منسوجات" : "Textiles"}</SelectItem>
                      <SelectItem value="home-kitchen">{isArabic ? "منزل ومطبخ" : "Home & Kitchen"}</SelectItem>
                      <SelectItem value="renewable-energy">{isArabic ? "طاقة متجددة" : "Renewable Energy"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{isArabic ? "الوصف" : "Description"} *</Label>
                <Textarea
                  id="description"
                  placeholder={isArabic ? "اكتب وصف مفصل للمنتج..." : "Write a detailed product description..."}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {isArabic ? "المواصفات" : "Specifications"}
                <Button type="button" variant="outline" size="sm" onClick={addSpecification} className="bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  {isArabic ? "إضافة مواصفة" : "Add Spec"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {specs.map((spec, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={isArabic ? "المفتاح (مثال: اللون)" : "Key (e.g., Color)"}
                    value={spec.key}
                    onChange={(e) => updateSpecification(index, "key", e.target.value)}
                  />
                  <Input
                    placeholder={isArabic ? "القيمة (مثال: أحمر)" : "Value (e.g., Red)"}
                    value={spec.value}
                    onChange={(e) => updateSpecification(index, "value", e.target.value)}
                  />
                  {specs.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSpecification(index)}
                      className="bg-transparent"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {isArabic ? "التسعير" : "Pricing"}
                <Button type="button" variant="outline" size="sm" onClick={addPricingTier} className="bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  {isArabic ? "إضافة شريحة" : "Add Tier"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pricingTiers.map((tier, index) => (
                <div key={index} className="grid gap-2 md:grid-cols-4">
                  <div className="space-y-1">
                    <Label className="text-xs">{isArabic ? "الحد الأدنى" : "Min Qty"}</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={tier.minQty || ""}
                      onChange={(e) => updatePricingTier(index, "minQty", Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{isArabic ? "الحد الأقصى" : "Max Qty"}</Label>
                    <Input
                      type="number"
                      placeholder={isArabic ? "اختياري" : "Optional"}
                      value={tier.maxQty || ""}
                      onChange={(e) => updatePricingTier(index, "maxQty", Number.parseInt(e.target.value) || undefined)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{isArabic ? "سعر الوحدة" : "Unit Price"}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={tier.unitPrice || ""}
                      onChange={(e) => updatePricingTier(index, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex items-end">
                    {pricingTiers.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePricingTier(index)}
                        className="bg-transparent"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Visibility */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "الحالة والرؤية" : "Status & Visibility"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{isArabic ? "الحالة" : "Status"}</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
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

              <div className="space-y-2">
                <Label>{isArabic ? "الرؤية" : "Visibility"}</Label>
                <Select
                  value={formData.visibility}
                  onValueChange={(value) => setFormData({ ...formData, visibility: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">{isArabic ? "خاص" : "Private"}</SelectItem>
                    <SelectItem value="public">{isArabic ? "عام" : "Public"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Order Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "إعدادات الطلب" : "Order Settings"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="moq">{isArabic ? "الحد الأدنى للطلب" : "Minimum Order Quantity"} *</Label>
                <Input
                  id="moq"
                  type="number"
                  placeholder="1"
                  value={formData.moq}
                  onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="leadTime">{isArabic ? "مدة التسليم (أيام)" : "Lead Time (Days)"}</Label>
                <Input
                  id="leadTime"
                  type="number"
                  placeholder="30"
                  value={formData.leadTimeDays}
                  onChange={(e) => setFormData({ ...formData, leadTimeDays: e.target.value })}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sampleAvailable"
                    checked={formData.sampleAvailable}
                    onCheckedChange={(checked) => setFormData({ ...formData, sampleAvailable: checked as boolean })}
                  />
                  <Label htmlFor="sampleAvailable">{isArabic ? "عينة متاحة" : "Sample Available"}</Label>
                </div>

                {formData.sampleAvailable && (
                  <div className="space-y-2">
                    <Label htmlFor="samplePrice">{isArabic ? "سعر العينة" : "Sample Price"}</Label>
                    <Input
                      id="samplePrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.samplePrice}
                      onChange={(e) => setFormData({ ...formData, samplePrice: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "العلامات" : "Tags"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder={isArabic ? "أضف علامة..." : "Add tag..."}
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" size="sm" onClick={addTag} className="bg-transparent">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                    >
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-primary/70">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
