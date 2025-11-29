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
import { listWarehouses, Warehouse } from "@/src/services/inventory-api"
import { MediaUpload } from "./MediaUpload"
import { PricingTiered } from "./PricingTiered"
import { EnhancedSkuManager } from "./EnhancedSkuManager"
import { ProductContent } from "./ProductContent"
import { CategorySelector } from "./CategorySelector"
import { QuickWarehouseModal } from "./QuickWarehouseModal"
import { VideoUpload } from "./VideoUpload"
import { Wand2, Loader2, AlertCircle, CheckCircle, FolderTree } from "lucide-react"
import { toast } from "sonner"

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
  const [categoryName, setCategoryName] = useState("")
  const [categoryParentName, setCategoryParentName] = useState("")
  const [categorySelectorOpen, setCategorySelectorOpen] = useState(false)
  const [moq, setMoq] = useState(1)
  const [productUnitId, setProductUnitId] = useState(1)
  const [isActive, setIsActive] = useState(true)
  const [priceType, setPriceType] = useState<"range" | "tiered" | "sku">("range")

  // Complex fields state
  const [existingMedia, setExistingMedia] = useState<ProductDetail["media"]>([])
  const [newMediaFiles, setNewMediaFiles] = useState<File[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [mediaToRemove, setMediaToRemove] = useState<number[]>([])
  const [rangePrice, setRangePrice] = useState({ min_price: "", max_price: "" })
  const [tieredPrices, setTieredPrices] = useState<{ min_quantity: number; price: number }[]>([])
  const [enhancedSkus, setEnhancedSkus] = useState<any[]>([])
  const [content, setContent] = useState<any>(null)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [selectedWarehouseIds, setSelectedWarehouseIds] = useState<number[]>([])
  const [loadingWarehouses, setLoadingWarehouses] = useState<boolean>(false)
  const [quickWarehouseModalOpen, setQuickWarehouseModalOpen] = useState(false)
  const [hasDraft, setHasDraft] = useState(false)

  // LocalStorage key for draft
  const DRAFT_KEY = 'product_form_draft'

  // Save draft to localStorage
  const saveDraft = () => {
    const draft = {
      name,
      description,
      categoryId,
      categoryName,
      categoryParentName,
      selectedWarehouseIds,
      moq,
      productUnitId,
      isActive,
      priceType,
      rangePrice,
      tieredPrices,
      enhancedSkus,
      content,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    setHasDraft(true)
    toast.success("Draft Saved", {
      description: "Your product draft has been saved locally"
    })
  }

  // Load draft from localStorage
  const loadDraft = () => {
    const draftStr = localStorage.getItem(DRAFT_KEY)
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr)
        setName(draft.name || "")
        setDescription(draft.description || "")
        setCategoryId(draft.categoryId || "")
        setCategoryName(draft.categoryName || "")
        setCategoryParentName(draft.categoryParentName || "")
        setSelectedWarehouseIds(draft.selectedWarehouseIds || [])
        setMoq(draft.moq || 1)
        setProductUnitId(draft.productUnitId || 1)
        setIsActive(draft.isActive ?? true)
        setPriceType(draft.priceType || "sku")
        setRangePrice(draft.rangePrice || { min_price: "", max_price: "" })
        setTieredPrices(draft.tieredPrices || [])
        setEnhancedSkus(draft.enhancedSkus || [])
        setContent(draft.content || null)
        setErrors({})
        toast.success("Draft Loaded", {
          description: "Your saved draft has been restored"
        })
      } catch (error) {
        console.error('Failed to load draft:', error)
      }
    }
  }

  // Clear draft from localStorage
  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY)
    setHasDraft(false)
    toast.success("Draft Cleared", {
      description: "Your saved draft has been removed"
    })
  }

  // Check for draft on mount
  useEffect(() => {
    if (!isEditMode) {
      const draftStr = localStorage.getItem(DRAFT_KEY)
      setHasDraft(!!draftStr)
    }
  }, [isEditMode])

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

    if (!name.trim()) newErrors.name = t.productNameRequired
    if (!description.trim()) newErrors.description = t.descriptionRequired
    if (!categoryId) newErrors.categoryId = t.categoryRequired
    if (moq < 1) newErrors.moq = t.moqMustBeAtLeast
    const remainingExistingMediaCount = existingMedia.filter(m => !mediaToRemove.includes(m.id as any)).length
    if (newMediaFiles.length === 0 && remainingExistingMediaCount === 0) {
      newErrors.media = t.atLeastOneMediaRequired
    }

    if (priceType === "range") {
      if (!rangePrice.min_price) newErrors.min_price = t.minimumPriceRequired
      if (!rangePrice.max_price) newErrors.max_price = t.maximumPriceRequired
      if (rangePrice.min_price && rangePrice.max_price && 
          parseFloat(rangePrice.min_price) >= parseFloat(rangePrice.max_price)) {
        newErrors.max_price = t.maximumPriceMustBeGreater
      }
    }

    if (priceType === "tiered" && tieredPrices.length === 0) {
      newErrors.pricing = t.atLeastOneTierRequired
    }

    if (priceType === "sku" && enhancedSkus.length === 0) {
      newErrors.pricing = t.atLeastOneSkuRequired
    }

    // Check if warehouses are available and selected (required for all price types)
    if (warehouses.length === 0) {
      newErrors.warehouses = t.atLeastOneWarehouseRequired
    } else if (selectedWarehouseIds.length === 0) {
      newErrors.selectedWarehouses = t.pleaseSelectWarehouse
    }

    // Validate SKUs if they exist
    if (priceType === "sku" && enhancedSkus.length > 0) {
      enhancedSkus.forEach((sku, index) => {
        if (!sku.code) {
          newErrors[`sku_${index}_code`] = t.skuCodeRequired.replace('{index}', String(index + 1))
        }
        if (!sku.inventory || !sku.inventory.warehouses || sku.inventory.warehouses.length === 0) {
          newErrors[`sku_${index}_inventory`] = t.skuInventoryRequired.replace('{index}', String(index + 1))
        }
        if (!sku.attributes || sku.attributes.length === 0) {
          newErrors[`sku_${index}_attributes`] = t.skuAttributesRequired.replace('{index}', String(index + 1))
        } else {
          sku.attributes.forEach((attr: any, attrIndex: number) => {
            if (!attr.type || !['select', 'color', 'image'].includes(attr.type)) {
              newErrors[`sku_${index}_attr_${attrIndex}_type`] = t.invalidAttributeType.replace('{index}', String(index + 1))
            }
            if (!attr.variation_value_id) {
              newErrors[`sku_${index}_attr_${attrIndex}_variation`] = t.variationValueRequired.replace('{index}', String(index + 1))
            }
            if (attr.type === 'color' && !attr.hex_color) {
              newErrors[`sku_${index}_attr_${attrIndex}_color`] = t.colorValueRequired.replace('{index}', String(index + 1))
            }
            if (attr.type === 'image' && !(attr.image instanceof File)) {
              newErrors[`sku_${index}_attr_${attrIndex}_image`] = t.imageFileRequired.replace('{index}', String(index + 1))
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
      setCategoryName(initialData.category.name || "")
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

  // Fetch warehouses function
  const fetchWarehouses = async () => {
    try {
      setLoadingWarehouses(true)
      const res = await listWarehouses()
      const warehouseList = res.data || []
      setWarehouses(warehouseList)
      // Auto-select first warehouse if available and no warehouse is selected
      if (warehouseList.length > 0 && selectedWarehouseIds.length === 0 && !isEditMode) {
        setSelectedWarehouseIds([warehouseList[0].id])
      }
    } catch (e) {
      // Non-blocking: keep defaults if fetch fails
      console.error('Failed to fetch warehouses:', e)
    } finally {
      setLoadingWarehouses(false)
    }
  }

  // Load warehouses for SKU inventory selection
  useEffect(() => {
    fetchWarehouses()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
    const firstErrorElement = document.querySelector('.border-red-500')
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return
  }

  setIsSubmitting(true)
  
  try {
    const fd = new FormData()
    
    // Core product fields
    fd.append('product[name]', name)
    fd.append('product[description]', description)
    fd.append('product[moq]', String(moq))
    fd.append('product[product_unit_id]', String(productUnitId))
    fd.append('product[price_type]', priceType)
    fd.append('product[is_active]', isActive ? '1' : '0')
    fd.append('product[category_id]', String(parseInt(categoryId)))

    // Content handling (same as before)
    // ... content code ...

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

    // SKUs: CORRECTED TO MATCH API SPEC
    const appendSkuToFormData = (sku: any, skuIndex: number) => {
      // Required fields
      if (sku.code) fd.append(`skus[${skuIndex}][code]`, String(sku.code))
      if (typeof sku.price !== 'undefined') fd.append(`skus[${skuIndex}][price]`, String(sku.price))
      
      // Package details - API expects STRINGS not numbers
      if (sku.package_details) {
        const pd = sku.package_details
        if (pd.mass_unit) fd.append(`skus[${skuIndex}][package_details][mass_unit]`, String(pd.mass_unit))
        if (typeof pd.weight !== 'undefined') fd.append(`skus[${skuIndex}][package_details][weight]`, String(pd.weight)) // String!
        if (pd.distance_unit) fd.append(`skus[${skuIndex}][package_details][distance_unit]`, String(pd.distance_unit))
        if (typeof pd.height !== 'undefined') fd.append(`skus[${skuIndex}][package_details][height]`, String(pd.height)) // String!
        if (typeof pd.length !== 'undefined') fd.append(`skus[${skuIndex}][package_details][length]`, String(pd.length)) // String!
        if (typeof pd.width !== 'undefined') fd.append(`skus[${skuIndex}][package_details][width]`, String(pd.width)) // String!
      }
      
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
      if (sku.attributes && Array.isArray(sku.attributes) && sku.attributes.length > 0) {
        sku.attributes.forEach((attr: any, attrIndex: number) => {
          if (attr && attr.type) {
            fd.append(`skus[${skuIndex}][attributes][${attrIndex}][type]`, String(attr.type))
            
            // Variation value ID is required
            if (attr.variation_value_id) {
              fd.append(`skus[${skuIndex}][attributes][${attrIndex}][variation_value_id]`, String(attr.variation_value_id))
            }
            
            // Color type: hex_color is required
            if (attr.type === 'color' && attr.hex_color) {
              fd.append(`skus[${skuIndex}][attributes][${attrIndex}][hex_color]`, String(attr.hex_color))
            }
            
            // Image type: image file is required
            if (attr.type === 'image' && attr.image && attr.image instanceof File) {
              fd.append(`skus[${skuIndex}][attributes][${attrIndex}][image]`, attr.image)
            }
          }
        })
      }
    }

    // Process SKUs based on price type
    if (priceType === 'sku' && enhancedSkus && enhancedSkus.length > 0) {
      enhancedSkus.forEach((sku: any, skuIndex: number) => {
        appendSkuToFormData(sku, skuIndex)
      })
    } else {
      // For range/tiered pricing, create a default SKU
      const defaultPrice = priceType === 'range' 
        ? parseFloat(rangePrice.min_price || '0') 
        : (tieredPrices.length > 0 ? tieredPrices[0].price : 0)

      const defaultSku = {
        code: `SKU-${name.substring(0, 5).replace(/\s+/g, '-').toUpperCase()}-${Date.now()}`,
        price: defaultPrice,
        package_details: {
          mass_unit: 'kg',
          weight: 1,        // Will be converted to string
          distance_unit: 'cm',
          height: 10,       // Will be converted to string
          length: 10,       // Will be converted to string
          width: 10         // Will be converted to string
        },
        inventory: {
          warehouses: selectedWarehouseIds.map(warehouseId => ({
            warehouse_id: warehouseId,
            on_hand: 0,
            reserved: 0,
            reorder_point: 5,
            restock_level: 20,
            track_inventory: true
          }))
        },
        attributes: [
          {
            type: 'select',
            variation_value_id: 1,
          }
        ]
      }
      
      appendSkuToFormData(defaultSku, 0)
    }

    // Media files
    if (newMediaFiles.length > 0) {
      newMediaFiles.forEach((file) => {
        fd.append('media[]', file)
      })
    }

    // Video
    if (videoFile) {
      fd.append('video', videoFile)
    }

    // Media removal (for edit mode)
    if (isEditMode && mediaToRemove.length > 0) {
      mediaToRemove.forEach(id => fd.append('media[remove][]', String(id)))
    }

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.group('📦 FormData Summary:')
      console.log('Price Type:', priceType)
      console.log('SKU Count:', priceType === 'sku' ? enhancedSkus.length : 1)
      
      // Log a sample SKU structure
      if (priceType === 'sku' && enhancedSkus.length > 0) {
        console.log('Sample SKU:', enhancedSkus[0])
      }
      
      // List all FormData keys for verification
      const keys = Array.from(fd.keys())
      console.log('FormData Keys:', keys.length)
      console.log('SKU-related keys:', keys.filter(k => k.startsWith('skus[')))
      console.groupEnd()
    }

    await onSubmit(fd)
    
    // Clear draft on successful submission
    if (!isEditMode) {
      localStorage.removeItem(DRAFT_KEY)
      setHasDraft(false)
    }
  } catch (error) {
    console.error('Form submission error:', error)
  } finally {
    setIsSubmitting(false)
  }
}

  const renderPricingSection = () => {
    // Filter warehouses to only show selected ones for SKU manager
    const selectedWarehouses = warehouses.filter(w => selectedWarehouseIds.includes(w.id))
    
    switch (priceType) {
      case "range": return <PricingRange range={rangePrice} setRange={setRangePrice} errors={errors} />
      case "tiered": return <PricingTiered tiers={tieredPrices} setTiers={setTieredPrices} />
      case "sku": return <EnhancedSkuManager skus={enhancedSkus} setSkus={setEnhancedSkus} warehouses={selectedWarehouses} />
      default: return null
    }
  }

  return (
    <>
      {/* Category Selector Modal */}
      <CategorySelector
        open={categorySelectorOpen}
        onOpenChange={setCategorySelectorOpen}
        selectedCategoryId={categoryId}
        onSelect={(id, name, parentName) => {
          setCategoryId(id)
          setCategoryName(name)
          setCategoryParentName(parentName || "")
        }}
      />

      {/* Quick Warehouse Creation Modal */}
      <QuickWarehouseModal
        open={quickWarehouseModalOpen}
        onOpenChange={setQuickWarehouseModalOpen}
        onWarehouseCreated={fetchWarehouses}
      />

      <div className="space-y-6">
      {/* Header with Development Auto-Fill and Draft Management */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditMode ? t.editProduct : t.addProduct}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditMode ? t.updateProductInfo : t.createNewProductInCatalog}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {!isEditMode && hasDraft && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={loadDraft}
              className="flex items-center gap-2"
            >
              {t.loadDraft}
            </Button>
          )}
          
          {isDevelopment && !isEditMode && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={fillSampleData}
              className="flex items-center gap-2 border-dashed"
            >
              <Wand2 className="h-4 w-4" />
              {t.fillSampleData}
              <Badge variant="secondary" className="text-xs">DEV</Badge>
            </Button>
          )}
        </div>
      </div>

      <form id="product-form" onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
              {/* Warehouse Selection - Required for all products */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-medium">📦</div>
                <div>
                  <CardTitle className="text-lg">{t.selectWarehouses}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t.chooseWarehouses}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingWarehouses ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">{t.loadingWarehouses}</span>
                </div>
              ) : warehouses.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto" />
                  <div>
                    <p className="font-medium text-foreground">{t.noWarehousesFound}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t.createWarehouseBefore}
                    </p>
                  </div>
                  {errors.warehouses && (
                    <div className="flex items-center justify-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.warehouses}
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="default"
                    className="w-full"
                    onClick={() => setQuickWarehouseModalOpen(true)}
                  >
                    {t.warehouseNewButton}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {warehouses.map((warehouse) => {
                      const isSelected = selectedWarehouseIds.includes(warehouse.id)
                      
                      const toggleWarehouse = () => {
                        setSelectedWarehouseIds(prev => 
                          prev.includes(warehouse.id)
                            ? prev.filter(id => id !== warehouse.id)
                            : [...prev, warehouse.id]
                        )
                      }
                      
                      return (
                        <div
                          key={warehouse.id}
                          onClick={toggleWarehouse}
                          className={`relative flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50 hover:bg-accent/50'
                          }`}
                        >
                          <div onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleWarehouse()}
                              className="pointer-events-auto"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{warehouse.name}</h4>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {warehouse.code || `ID: ${warehouse.id}`}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {selectedWarehouseIds.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      {selectedWarehouseIds.length === 1
                        ? `1 ${t.warehouseSelected}`
                        : `${selectedWarehouseIds.length} ${t.warehousesSelected}`
                      }
                    </div>
                  )}
                  
                  {errors.selectedWarehouses && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errors.selectedWarehouses}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">1</div>
                <CardTitle className="text-lg">{t.basicInformation}</CardTitle>
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
                  placeholder={t.enterProductName}
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
                  placeholder={t.describeProduct}
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
                  <Label className="text-sm font-medium">
                    {t.category} *
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCategorySelectorOpen(true)}
                    className={`w-full justify-start font-normal ${errors.categoryId ? "border-red-500" : ""}`}
                  >
                    <FolderTree className="h-4 w-4 mr-2 flex-shrink-0" />
                    {categoryName ? (
                      <div className="flex flex-col items-start text-left overflow-hidden">
                        <span className="truncate w-full">{categoryName}</span>
                        {categoryParentName && (
                          <span className="text-xs text-muted-foreground truncate w-full">
                            {categoryParentName}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">{t.selectCategory || "Select Category"}</span>
                    )}
                  </Button>
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
                <CardTitle className="text-lg">{t.productContent}</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {t.addDetailedSpecs}
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
                {t.uploadProductImages}
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

          {/* Video Upload */}
          <VideoUpload 
            videoFile={videoFile} 
            onVideoChange={setVideoFile} 
          />

          {/* Pricing */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-medium">4</div>
                <CardTitle className="text-lg">{t.pricing}</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {t.choosePricingStrategy}
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
              <CardTitle className="text-lg">{t.saveAndPublish}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Warehouse Warning */}
              {errors.warehouses && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      {errors.warehouses}
                    </div>
                  </div>
                </div>
              )}

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
                  <>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={saveDraft}
                      disabled={loading || isSubmitting}
                    >
                      {t.saveAsDraft}
                    </Button>
                    
                    {hasDraft && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="w-full text-muted-foreground"
                        onClick={clearDraft}
                        disabled={loading || isSubmitting}
                      >
                        {t.clearDraft}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Help & Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                {t.tipsForSuccess}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-2">
                <p className="font-medium">📸 {t.highQualityImages}</p>
                <p className="text-muted-foreground">{t.useClearPhotos}</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium">📝 {t.detailedDescription}</p>
                <p className="text-muted-foreground">{t.includeKeyFeatures}</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium">💰 {t.competitivePricing}</p>
                <p className="text-muted-foreground">{t.researchMarketPrices}</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium">📦 {t.accurateMOQ}</p>
                <p className="text-muted-foreground">{t.setRealisticMOQ}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
    </>
  )
}