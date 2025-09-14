"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useI18n } from "@/lib/i18n/context"
import { ProductDetail } from "@/src/services/types/product-types"
import { MediaUpload } from "./MediaUpload"
import { PricingTiered } from "./PricingTiered"
import { SkuManager } from "./SkuManager"
import { ProductContent } from "./ProductContent"
import { EnhancedSkuManager } from "./EnhancedSkuManager"
import { Wand2, Loader2, AlertCircle, CheckCircle } from "lucide-react"

const PricingRange = ({ range, setRange, errors }: { 
  range: { min_price: string; max_price: string }; 
  setRange: (range: { min_price: string; max_price: string }) => void; 
  errors?: Record<string, string> 
}) => {
  const { t } = useI18n()
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="min_price" className="text-sm font-medium">{t.minPrice} *</Label>
        <Input 
          id="min_price"
          type="number" 
          step="0.01"
          min="0"
          value={range.min_price} 
          onChange={e => setRange({ ...range, min_price: e.target.value })}
          className={errors?.min_price ? "border-red-500 focus-visible:ring-red-500" : ""}
          placeholder="0.00"
        />
        {errors?.min_price && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {errors.min_price}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="max_price" className="text-sm font-medium">{t.maxPrice} *</Label>
        <Input 
          id="max_price"
          type="number" 
          step="0.01"
          min="0"
          value={range.max_price} 
          onChange={e => setRange({ ...range, max_price: e.target.value })}
          className={errors?.max_price ? "border-red-500 focus-visible:ring-red-500" : ""}
          placeholder="0.00"
        />
        {errors?.max_price && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {errors.max_price}
          </div>
        )}
      </div>
    </div>
  )
}

interface ProductFormProps {
  initialData?: ProductDetail | null
  onSubmit: (formData: FormData) => Promise<any>
  loading: boolean
}

// Development sample data
const SAMPLE_DATA = {
  name: "Wireless Bluetooth Headphones - Premium Quality",
  description: "High-quality wireless Bluetooth headphones with noise cancellation, premium sound quality, and long battery life. Perfect for music lovers and professionals who demand the best audio experience.",
  categoryId: "1",
  moq: 50,
  productUnitId: 1,
  isActive: true,
  priceType: "range" as const,
  rangePrice: { min_price: "25.00", max_price: "45.00" },
  tieredPrices: [
    { min_quantity: 50, price: 32 },
    { min_quantity: 100, price: 30 },
    { min_quantity: 500, price: 28 },
    { min_quantity: 1000, price: 25 }
  ],
  content: {
    general: { 
      name: "Wireless Bluetooth Headphones",
      material: "Premium ABS Plastic & Memory Foam",
      brand: "TechSound Pro",
      model: "WBH-2024-001"
    },
    specifications: [
      { name: "Bluetooth Version", value: "5.3" },
      { name: "Battery Life", value: "30 hours" },
      { name: "Charging Time", value: "2 hours" },
      { name: "Driver Size", value: "40mm" },
      { name: "Frequency Response", value: "20Hz - 20kHz" },
      { name: "Impedance", value: "32Ω" }
    ],
    shipping: [
      { method: "Express", time: "5-7 days", cost: "$15" },
      { method: "Standard", time: "10-15 days", cost: "$8" },
      { method: "Economy", time: "20-30 days", cost: "$3" }
    ]
  }
}

export function ProductForm({ initialData, onSubmit, loading }: ProductFormProps) {
  const { t } = useI18n()
  const isEditMode = !!initialData
  const isDevelopment = process.env.NODE_ENV === 'development'

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [moq, setMoq] = useState(1)
  const [productUnitId, setProductUnitId] = useState(1)
  const [isActive, setIsActive] = useState(true)
  const [priceType, setPriceType] = useState<"range" | "tiered" | "sku">("range")

  // Complex fields state
  const [existingMedia, setExistingMedia] = useState<ProductDetail["media"]>([])
  const [newMediaFiles, setNewMediaFiles] = useState<File[]>([])
  const [mediaToRemove, setMediaToRemove] = useState<number[]>([])
  const [rangePrice, setRangePrice] = useState({ min_price: "", max_price: "" })
  const [tieredPrices, setTieredPrices] = useState<{ min_quantity: number; price: number }[]>([])
  const [skus, setSkus] = useState<any[]>([])
  const [enhancedSkus, setEnhancedSkus] = useState<any[]>([])
  const [content, setContent] = useState<any>(null)

  // Auto-fill function for development
  const fillSampleData = () => {
    setName(SAMPLE_DATA.name)
    setDescription(SAMPLE_DATA.description)
    setCategoryId(SAMPLE_DATA.categoryId)
    setMoq(SAMPLE_DATA.moq)
    setProductUnitId(SAMPLE_DATA.productUnitId)
    setIsActive(SAMPLE_DATA.isActive)
    setPriceType(SAMPLE_DATA.priceType)
    setRangePrice(SAMPLE_DATA.rangePrice)
    setTieredPrices(SAMPLE_DATA.tieredPrices)
    setContent(SAMPLE_DATA.content)
    setErrors({}) // Clear any validation errors
  }

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = "Product name is required"
    if (!description.trim()) newErrors.description = "Description is required"
    if (!categoryId) newErrors.categoryId = "Category is required"
    if (moq < 1) newErrors.moq = "MOQ must be at least 1"
    if (newMediaFiles.length === 0 && existingMedia.length === 0) {
      newErrors.media = "At least one media file is required"
    }

    if (priceType === "range") {
      if (!rangePrice.min_price) newErrors.min_price = "Minimum price is required"
      if (!rangePrice.max_price) newErrors.max_price = "Maximum price is required"
      if (rangePrice.min_price && rangePrice.max_price && 
          parseFloat(rangePrice.min_price) >= parseFloat(rangePrice.max_price)) {
        newErrors.max_price = "Maximum price must be greater than minimum price"
      }
    }

    if (priceType === "tiered" && tieredPrices.length === 0) {
      newErrors.pricing = "At least one tier is required for tiered pricing"
    }

    if (priceType === "sku" && enhancedSkus.length === 0) {
      newErrors.pricing = "At least one SKU is required for SKU pricing"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setDescription(initialData.description)
      setCategoryId(String(initialData.category.id))
      setMoq(initialData.moq)
      // setProductUnitId(initialData.product_unit_id)
      setIsActive(initialData.is_active)
      setPriceType(initialData.price_type)
      setExistingMedia(initialData.media || [])
      if (initialData.price_type === 'range' && initialData.rangePrices) {
        setRangePrice({ min_price: initialData.rangePrices.minPrice, max_price: initialData.rangePrices.maxPrice })
      }
      if (initialData.price_type === 'tiered') {
        setTieredPrices(initialData.tieredPrices || [])
      }
      if (initialData.price_type === 'sku') {
        setSkus(initialData.skus || [])
      }
    }
  }, [initialData])

  // Clear errors when user starts typing
  useEffect(() => {
    if (errors.name && name) setErrors(prev => ({ ...prev, name: "" }))
  }, [name, errors.name])

  useEffect(() => {
    if (errors.description && description) setErrors(prev => ({ ...prev, description: "" }))
  }, [description, errors.description])

  useEffect(() => {
    if (errors.categoryId && categoryId) setErrors(prev => ({ ...prev, categoryId: "" }))
  }, [categoryId, errors.categoryId])

  useEffect(() => {
    if (errors.media && (newMediaFiles.length > 0 || existingMedia.length > 0)) {
      setErrors(prev => ({ ...prev, media: "" }))
    }
  }, [newMediaFiles, existingMedia, errors.media])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorElement = document.querySelector('.border-red-500')
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    setIsSubmitting(true)
    
    try {
    // Create the new JSON structure
    const productData = {
      product: {
        name,
        description,
        content,
        moq,
        product_unit_id: productUnitId,
        price_type: priceType,
        is_active: isActive,
        category_id: parseInt(categoryId)
      },
      media: newMediaFiles,
      ...(priceType === "range" && {
        range_price: {
            min_price: parseFloat(rangePrice.min_price),
            max_price: parseFloat(rangePrice.max_price)
        }
      }),
      ...(priceType === "tiered" && {
        tiered_prices: tieredPrices
      }),
      ...(priceType === "sku" && {
        skus: enhancedSkus
      })
    }

    // Create FormData for multipart/form-data submission
    const fd = new FormData()
    
    // Add the JSON data as a single field
    fd.append("data", JSON.stringify(productData))
    
    // Add media files separately
    newMediaFiles.forEach((file, index) => {
      fd.append(`media[${index}]`, file)
    })
    
      // Add SKU images if any
      if (priceType === "sku" && enhancedSkus.length > 0) {
        enhancedSkus.forEach((sku: any, skuIndex: number) => {
          if (sku.attributes) {
            sku.attributes.forEach((attr: any, attrIndex: number) => {
              if (attr.type === "image" && attr.image) {
                fd.append(`sku[${skuIndex}][attribute][${attrIndex}][image]`, attr.image)
              }
            })
          }
        })
      }

    if (isEditMode) {
        fd.append("_method", "PUT")
        mediaToRemove.forEach(id => fd.append("media[remove][]", String(id)))
    }

    await onSubmit(fd)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderPricingSection = () => {
    switch (priceType) {
      case "range": return <PricingRange range={rangePrice} setRange={setRangePrice} errors={errors} />
      case "tiered": return <PricingTiered tiers={tieredPrices} setTiers={setTieredPrices} />
      case "sku": return <EnhancedSkuManager skus={enhancedSkus} setSkus={setEnhancedSkus} />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Development Auto-Fill */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditMode ? t.editProduct : t.addProduct}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditMode ? 'Update your product information' : t.createNewProductInCatalog}
          </p>
        </div>
        
        {isDevelopment && !isEditMode && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={fillSampleData}
            className="flex items-center gap-2 border-dashed"
          >
            <Wand2 className="h-4 w-4" />
            Fill Sample Data
            <Badge variant="secondary" className="text-xs">DEV</Badge>
          </Button>
        )}
      </div>

    <form id="product-form" onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Information */}
        <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">1</div>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  {t.productName} *
                </Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Enter product name..."
                  className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.name && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.name}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  {t.description} *
                </Label>
                <Textarea 
                  id="description" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder="Describe your product features, benefits, and specifications..."
                  className={`min-h-[120px] ${errors.description ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {errors.description && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.description}
            </div>
                )}
            </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">
                    {t.category} *
                  </Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className={errors.categoryId ? "border-red-500 focus-visible:ring-red-500" : ""}>
                      <SelectValue placeholder={t.selectCategory} />
                    </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="1">Electronics & Electrical</SelectItem>
                      <SelectItem value="2">Textiles & Apparel</SelectItem>
                      <SelectItem value="3">Home & Kitchen</SelectItem>
                      <SelectItem value="4">Renewable Energy</SelectItem>
                  </SelectContent>
                </Select>
                  {errors.categoryId && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.categoryId}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="moq" className="text-sm font-medium">
                    {t.moq} *
                  </Label>
                  <Input 
                    id="moq" 
                    type="number" 
                    min="1"
                    value={moq} 
                    onChange={e => setMoq(Number(e.target.value) || 1)}
                    placeholder="1"
                    className={errors.moq ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.moq && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.moq}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-medium">2</div>
                <CardTitle className="text-lg">Product Content</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Add detailed specifications and shipping information (optional)
              </p>
            </CardHeader>
            <CardContent>
              <ProductContent content={content} setContent={setContent} />
          </CardContent>
        </Card>

          {/* Media Upload */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-medium">3</div>
                <CardTitle className="text-lg">{t.media}</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Upload product images and videos. First image will be the main display image.
              </p>
            </CardHeader>
            <CardContent>
        <MediaUpload 
            existingMedia={existingMedia}
            newFiles={newMediaFiles}
            onNewFiles={setNewMediaFiles}
            onRemoveExisting={(id) => setMediaToRemove([...mediaToRemove, id])}
            onRemoveNew={(file) => setNewMediaFiles(newMediaFiles.filter(f => f !== file))}
        />
              {errors.media && (
                <div className="flex items-center gap-2 text-sm text-red-600 mt-3">
                  <AlertCircle className="h-4 w-4" />
                  {errors.media}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
        <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-medium">4</div>
                <CardTitle className="text-lg">{t.pricing}</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Choose your pricing strategy and set competitive prices
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t.priceType}</Label>
              <Select value={priceType} onValueChange={(v: any) => setPriceType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                <SelectContent>
                  <SelectItem value="range">{t.priceRange}</SelectItem>
                  <SelectItem value="tiered">{t.tieredPricing}</SelectItem>
                  <SelectItem value="sku">{t.perSKUPricing}</SelectItem>
                </SelectContent>
              </Select>
            </div>

              <Separator />
              
              <div>
            {renderPricingSection()}
                {errors.pricing && (
                  <div className="flex items-center gap-2 text-sm text-red-600 mt-3">
                    <AlertCircle className="h-4 w-4" />
                    {errors.pricing}
                  </div>
                )}
              </div>
          </CardContent>
        </Card>
      </div>

        {/* Sidebar */}
      <div className="space-y-6">
          {/* Save Actions */}
        <Card>
            <CardHeader>
              <CardTitle className="text-lg">Save & Publish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
                <Checkbox 
                  id="is_active" 
                  checked={isActive} 
                  onCheckedChange={v => setIsActive(Boolean(v.valueOf()))} 
                />
                <Label htmlFor="is_active" className="text-sm font-medium">
                  {t.productIsActive}
                </Label>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading || isSubmitting}
                >
                  {(loading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditMode ? t.saveChanges : t.saveProduct}
                </Button>
                
                {!isEditMode && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={async () => {
                      const originalActive = isActive
                      setIsActive(false)
                      // Wait for next tick to ensure state is updated
                      await new Promise(resolve => setTimeout(resolve, 0))
                      const formElement = document.getElementById('product-form') as HTMLFormElement
                      if (formElement) {
                        const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
                        formElement.dispatchEvent(submitEvent)
                      }
                      setIsActive(originalActive) // Restore original state
                    }}
                    disabled={loading || isSubmitting}
                  >
                    Save as Draft
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Help & Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Tips for Success
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-2">
                <p className="font-medium">📸 High-quality images</p>
                <p className="text-muted-foreground">Use clear, well-lit photos from multiple angles</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium">📝 Detailed description</p>
                <p className="text-muted-foreground">Include key features, materials, and dimensions</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium">💰 Competitive pricing</p>
                <p className="text-muted-foreground">Research market prices for similar products</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium">📦 Accurate MOQ</p>
                <p className="text-muted-foreground">Set realistic minimum order quantities</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
    </div>
  )
}
