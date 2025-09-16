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
import { EnhancedSkuManager } from "./EnhancedSkuManager"
import { ProductContent } from "./ProductContent"
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
  description: "High-quality wireless Bluetooth headphones with advanced noise cancellation, premium sound quality, and extended battery life. Perfect for music lovers, professionals, and gamers who demand the best audio experience. Features include touch controls, voice assistant support, and quick charge capability.",
  categoryId: "1",
  moq: 50,
  productUnitId: 1,
  isActive: true,
  priceType: "sku" as const,
  rangePrice: { min_price: "25.00", max_price: "45.00" },
  tieredPrices: [
    { min_quantity: 50, price: 32 },
    { min_quantity: 100, price: 30 },
    { min_quantity: 500, price: 28 },
    { min_quantity: 1000, price: 25 },
    { min_quantity: 2000, price: 23 }
  ],
  enhancedSkus: [
    {
      code: "WBH-BLACK-PREMIUM-001",
      price: 32.00,
      inventory: {
        warehouses: [
          {
            warehouse_id: 31,
            on_hand: 100,
            reserved: 10,
            reorder_point: 20,
            restock_level: 50,
            track_inventory: true
          }
        ]
      },
      attributes: [
        { type: "select", variation_value_id: 5 },
        { type: "color", variation_value_id: 7, hex_color: "#000000" },
        { type: "select", variation_value_id: 8 }
      ]
    },
    {
      code: "WBH-WHITE-STANDARD-002", 
      price: 28.00,
      inventory: {
        warehouses: [
          {
            warehouse_id: 31,
            on_hand: 150,
            reserved: 5,
            reorder_point: 25,
            restock_level: 75,
            track_inventory: true
          }
        ]
      },
      attributes: [
        { type: "select", variation_value_id: 6 },
        { type: "color", variation_value_id: 9, hex_color: "#FFFFFF" },
        { type: "select", variation_value_id: 10 }
      ]
    },
    {
      code: "WBH-BLUE-GAMING-003",
      price: 35.00,
      inventory: {
        warehouses: [
          {
            warehouse_id: 31,
            on_hand: 75,
            reserved: 15,
            reorder_point: 15,
            restock_level: 40,
            track_inventory: true
          }
        ]
      },
      attributes: [
        { type: "select", variation_value_id: 11 },
        { type: "color", variation_value_id: 12, hex_color: "#0066CC" },
        { type: "select", variation_value_id: 13 },
        { type: "select", variation_value_id: 14 }
      ]
    }
  ],
  content: {
    general: { 
      name: "TechSound Pro Wireless Headphones",
      material: "Premium ABS Plastic, Memory Foam, Stainless Steel",
      brand: "TechSound Pro",
      model: "WBH-2024-PRO-001",
      weight: "280g",
      dimensions: "190 x 160 x 80 mm",
      color: "Black, White, Blue",
      warranty: "1-3 Years (varies by edition)",
      certification: "CE, FCC, RoHS",
      origin: "Made in China",
      packaging: "Premium Gift Box with Accessories"
    },
    specifications: [
      // Audio Specifications
      { name: "Bluetooth Version", value: "5.3 with aptX HD" },
      { name: "Audio Codecs", value: "SBC, AAC, aptX, aptX HD" },
      { name: "Driver Size", value: "40mm Neodymium" },
      { name: "Frequency Response", value: "20Hz - 40kHz" },
      { name: "Impedance", value: "32Ω ±15%" },
      { name: "Sensitivity", value: "110dB ±3dB" },
      { name: "THD", value: "<0.1% (1kHz, 1mW)" },
      
      // Battery & Power
      { name: "Battery Capacity", value: "600mAh Lithium" },
      { name: "Playback Time", value: "30 hours (ANC off), 25 hours (ANC on)" },
      { name: "Talk Time", value: "35 hours" },
      { name: "Standby Time", value: "200 hours" },
      { name: "Charging Time", value: "2 hours (full), 15 min (3 hours play)" },
      { name: "Charging Port", value: "USB-C with fast charge" },
      
      // Features
      { name: "Active Noise Cancellation", value: "Yes, up to -35dB" },
      { name: "Transparency Mode", value: "Yes, adjustable" },
      { name: "Touch Controls", value: "Gesture control with customization" },
      { name: "Voice Assistant", value: "Siri, Google Assistant, Alexa" },
      { name: "Multipoint Connection", value: "Connect 2 devices simultaneously" },
      { name: "App Support", value: "TechSound Pro App (iOS/Android)" },
      { name: "Water Resistance", value: "IPX4 rated" },
      
      // Physical
      { name: "Operating Range", value: "10 meters (33 feet)" },
      { name: "Operating Temperature", value: "-10°C to +55°C" },
      { name: "Storage Temperature", value: "-20°C to +60°C" },
      { name: "Foldable Design", value: "Yes, 90° swivel + fold flat" }
    ],
    shipping: [
      { 
        method: "Express Shipping", 
        time: "5-7 business days", 
        cost: "$15.00",
        description: "DHL/FedEx with tracking and insurance"
      },
      { 
        method: "Standard Shipping", 
        time: "10-15 business days", 
        cost: "$8.00",
        description: "Regular postal service with basic tracking"
      },
      { 
        method: "Economy Shipping", 
        time: "20-30 business days", 
        cost: "$3.00",
        description: "Slowest but most economical option"
      },
      {
        method: "Air Freight (Bulk)",
        time: "7-12 business days",
        cost: "Contact for quote",
        description: "Best for orders over 1000 units"
      }
    ],
    features: [
      "Advanced Active Noise Cancellation up to -35dB",
      "Premium 40mm Neodymium drivers for exceptional sound",
      "30-hour battery life with quick 15-minute charge",
      "Bluetooth 5.3 with aptX HD for superior audio quality",
      "Comfortable memory foam ear cushions",
      "Intuitive touch controls with gesture support",
      "Voice assistant compatibility (Siri, Google, Alexa)",
      "Foldable design for easy storage and travel",
      "IPX4 water resistance for workout protection",
      "Multipoint connection for two devices",
      "Dedicated mobile app for customization"
    ],
    whatsIncluded: [
      "1x Wireless Bluetooth Headphones",
      "1x Premium Carrying Case", 
      "1x USB-C Charging Cable (1.2m)",
      "1x 3.5mm Audio Cable (1.5m)",
      "1x Airplane Adapter",
      "1x Quick Start Guide",
      "1x Warranty Card",
      "1x Premium Gift Box"
    ],
    targetMarkets: [
      "Music enthusiasts and audiophiles",
      "Business professionals for calls and meetings", 
      "Gamers seeking immersive audio experience",
      "Students for online learning and entertainment",
      "Travelers who need noise cancellation",
      "Fitness enthusiasts with water-resistant needs"
    ],
    qualityAssurance: [
      "ISO 9001:2015 certified manufacturing",
      "100% tested before shipping",
      "CE, FCC, RoHS compliance",
      "Quality control at every production stage",
      "30-day money-back guarantee",
      "Comprehensive warranty coverage"
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
    setEnhancedSkus(SAMPLE_DATA.enhancedSkus)
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
    const remainingExistingMediaCount = existingMedia.filter(m => !mediaToRemove.includes(m.id as any)).length
    if (newMediaFiles.length === 0 && remainingExistingMediaCount === 0) {
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

    // Validate SKUs if they exist
    if (priceType === "sku" && enhancedSkus.length > 0) {
      enhancedSkus.forEach((sku, index) => {
        if (!sku.code) {
          newErrors[`sku_${index}_code`] = `SKU ${index + 1} code is required`
        }
        if (!sku.inventory || !sku.inventory.warehouses || sku.inventory.warehouses.length === 0) {
          newErrors[`sku_${index}_inventory`] = `SKU ${index + 1} inventory is required`
        }
        if (!sku.attributes || sku.attributes.length === 0) {
          newErrors[`sku_${index}_attributes`] = `SKU ${index + 1} attributes are required`
        } else {
          sku.attributes.forEach((attr: any, attrIndex: number) => {
            if (!attr.type || !['select', 'color', 'image'].includes(attr.type)) {
              newErrors[`sku_${index}_attr_${attrIndex}_type`] = `Invalid attribute type for SKU ${index + 1}`
            }
            if (!attr.variation_value_id) {
              newErrors[`sku_${index}_attr_${attrIndex}_variation`] = `Variation value required for SKU ${index + 1}`
            }
            if (attr.type === 'color' && !attr.hex_color) {
              newErrors[`sku_${index}_attr_${attrIndex}_color`] = `Color value required for SKU ${index + 1}`
            }
            if (attr.type === 'image' && !(attr.image instanceof File)) {
              newErrors[`sku_${index}_attr_${attrIndex}_image`] = `Image file required for SKU ${index + 1}`
            }
          })
        }
      })
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
        // Map backend skus to enhancedSkus shape if necessary
        setEnhancedSkus((initialData.skus as any[]) || [])
      }
    }
  }, [initialData])

  // Clear errors when user starts typing
  useEffect(() => {
    setErrors(prev => {
      const newErrors = { ...prev }
      if (prev.name && name) delete newErrors.name
      if (prev.description && description) delete newErrors.description
      if (prev.categoryId && categoryId) delete newErrors.categoryId
      if (prev.media && (newMediaFiles.length > 0 || existingMedia.length > 0)) delete newErrors.media
      return newErrors
    })
  }, [name, description, categoryId, newMediaFiles, existingMedia])

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
      // Create FormData for multipart/form-data submission
      const fd = new FormData()
      
      // Core product fields
      fd.append('product[name]', name)
      fd.append('product[description]', description)
      fd.append('product[moq]', String(moq))
      fd.append('product[product_unit_id]', String(productUnitId))
      fd.append('product[price_type]', priceType)
      fd.append('product[is_active]', isActive ? '1' : '0')
      fd.append('product[category_id]', String(parseInt(categoryId)))

      // Content as nested fields (Laravel expects arrays, not a JSON string)
      const serializeContentAsJson = process.env.NEXT_PUBLIC_SERIALIZE_CONTENT_AS_JSON === 'true'
      if (content && serializeContentAsJson) {
        // If backend accepts JSON string for content, send as a single field
        fd.append('product[content]', JSON.stringify(content))
      } else if (content) {
        // general
        if (content.general) {
          Object.entries(content.general).forEach(([key, value]) => {
            fd.append(`product[content][general][${key}]`, String(value))
          })
        }
        // specifications
        if (Array.isArray(content.specifications)) {
          content.specifications.forEach((spec: any, index: number) => {
            if (spec && (spec.name || spec.value)) {
              fd.append(`product[content][specifications][${index}][name]`, String(spec.name ?? ''))
              fd.append(`product[content][specifications][${index}][value]`, String(spec.value ?? ''))
            }
          })
        }
        // shipping
        if (Array.isArray(content.shipping)) {
          content.shipping.forEach((ship: any, index: number) => {
            if (ship && (ship.method || ship.time || ship.cost)) {
              fd.append(`product[content][shipping][${index}][method]`, String(ship.method ?? ''))
              fd.append(`product[content][shipping][${index}][time]`, String(ship.time ?? ''))
              fd.append(`product[content][shipping][${index}][cost]`, String(ship.cost ?? ''))
              if (ship.description) {
                fd.append(`product[content][shipping][${index}][description]`, String(ship.description))
              }
            }
          })
        }
        // features, whatsIncluded, targetMarkets, qualityAssurance - handle as arrays
        if (Array.isArray(content.features)) {
          content.features.forEach((feature: string, index: number) => {
            fd.append(`product[content][features][${index}]`, String(feature))
          })
        }
        if (Array.isArray(content.whatsIncluded)) {
          content.whatsIncluded.forEach((item: string, index: number) => {
            fd.append(`product[content][whatsIncluded][${index}]`, String(item))
          })
        }
        if (Array.isArray(content.targetMarkets)) {
          content.targetMarkets.forEach((market: string, index: number) => {
            fd.append(`product[content][targetMarkets][${index}]`, String(market))
          })
        }
        if (Array.isArray(content.qualityAssurance)) {
          content.qualityAssurance.forEach((qa: string, index: number) => {
            fd.append(`product[content][qualityAssurance][${index}]`, String(qa))
          })
        }
      }

      // Pricing fields
      if (priceType === 'range') {
        fd.append('range_price[min_price]', String(parseFloat(rangePrice.min_price)))
        fd.append('range_price[max_price]', String(parseFloat(rangePrice.max_price)))
      }

      if (priceType === 'tiered') {
        tieredPrices.forEach((tier, index) => {
          fd.append(`tiered_prices[${index}][min_quantity]`, String(tier.min_quantity))
          fd.append(`tiered_prices[${index}][price]`, String(tier.price))
        })
      }

      // SKUs: Only append when price_type is 'sku' and we have valid SKUs
      if (priceType === 'sku' && enhancedSkus && enhancedSkus.length > 0) {
        enhancedSkus.forEach((sku: any, skuIndex: number) => {
          // Required fields
          if (sku.code) fd.append(`skus[${skuIndex}][code]`, String(sku.code))
          if (typeof sku.price !== 'undefined') fd.append(`skus[${skuIndex}][price]`, String(sku.price))
          
          // Inventory by warehouses
          if (sku.inventory?.warehouses) {
            sku.inventory.warehouses.forEach((w: any, wIndex: number) => {
              fd.append(`skus[${skuIndex}][inventory][warehouses][${wIndex}][warehouse_id]`, String(w.warehouse_id))
              fd.append(`skus[${skuIndex}][inventory][warehouses][${wIndex}][on_hand]`, String(w.on_hand))
              fd.append(`skus[${skuIndex}][inventory][warehouses][${wIndex}][reserved]`, String(w.reserved))
              fd.append(`skus[${skuIndex}][inventory][warehouses][${wIndex}][reorder_point]`, String(w.reorder_point))
              fd.append(`skus[${skuIndex}][inventory][warehouses][${wIndex}][restock_level]`, String(w.restock_level))
              fd.append(`skus[${skuIndex}][inventory][warehouses][${wIndex}][track_inventory]`, w.track_inventory ? '1' : '0')
            })
          }
          
          // Attributes
          if (sku.attributes) {
            sku.attributes.forEach((attr: any, attrIndex: number) => {
              fd.append(`skus[${skuIndex}][attributes][${attrIndex}][type]`, String(attr.type))
              if (attr.variation_value_id) {
                fd.append(`skus[${skuIndex}][attributes][${attrIndex}][variation_value_id]`, String(attr.variation_value_id))
              }
              if (attr.hex_color) {
                fd.append(`skus[${skuIndex}][attributes][${attrIndex}][hex_color]`, String(attr.hex_color))
              }
              if (attr.image && attr.image instanceof File) {
                fd.append(`skus[${skuIndex}][attributes][${attrIndex}][image]`, attr.image)
              }
            })
          }
        })
      }

      // Add media files (Laravel array notation)
      newMediaFiles.forEach((file) => {
        fd.append('media[]', file)
      })

      if (isEditMode) {
        mediaToRemove.forEach(id => fd.append('media[remove][]', String(id)))
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
                {/* Display SKU-specific validation errors */}
                {Object.entries(errors).filter(([key]) => key.startsWith('sku_')).map(([key, error]) => (
                  <div key={key} className="flex items-center gap-2 text-sm text-red-600 mt-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                ))}
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
                  checked={isActive === true} 
                  onCheckedChange={(v) => setIsActive(v === true)} 
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