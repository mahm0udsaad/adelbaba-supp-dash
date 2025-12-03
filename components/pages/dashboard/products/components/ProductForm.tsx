"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { useI18n } from "@/lib/i18n/context"
import { ProductDetail } from "@/src/services/types/product-types"
import { listWarehouses, Warehouse } from "@/src/services/inventory-api"
import { MediaUpload } from "./MediaUpload"
import { PricingTiered } from "./PricingTiered"
import { EnhancedSkuManager, type EnhancedSku } from "./EnhancedSkuManager"
import { ProductContent } from "./ProductContent"
import { CategorySelector } from "./CategorySelector"
import { QuickWarehouseModal } from "./QuickWarehouseModal"
import { VideoUpload } from "./VideoUpload"
import { Loader2, AlertCircle, CheckCircle, FolderTree } from "lucide-react"
import { toast } from "sonner"
import type { ProductContentBlock, ProductSku } from "@/src/services/types/product-types"

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

const createEmptyContent = (): ProductContentBlock => ({
  general: { name: "", material: "" },
  specifications: [{ name: "", value: "" }],
  shipping: [{ method: "", time: "", cost: "" }],
});

const normalizeContent = (incoming?: ProductContentBlock | string | null): ProductContentBlock => {
  let parsed: ProductContentBlock | null = null
  if (typeof incoming === "string") {
    try {
      parsed = JSON.parse(incoming)
    } catch {
      parsed = null
    }
  } else {
    parsed = incoming ?? null
  }

  if (!parsed) {
    return createEmptyContent();
  }

  const base = createEmptyContent();

  return {
    general: { ...base.general, ...(parsed.general || {}) },
    specifications: ((parsed.specifications && parsed.specifications.length > 0
      ? parsed.specifications
      : base.specifications) || []
    ).map(spec => ({
      name: spec?.name ?? "",
      value: spec?.value ?? "",
    })),
    shipping: ((parsed.shipping && parsed.shipping.length > 0
      ? parsed.shipping
      : base.shipping) || []
    ).map(method => ({
      method: method?.method ?? "",
      time: method?.time ?? "",
      cost: method?.cost ?? "",
    })),
  };
};

const normalizeSkuFromApi = (sku: ProductSku): EnhancedSku => {
  const packageDetails = {
    mass_unit: (sku.package_details?.mass_unit ?? "kg") as "g" | "kg" | "lb" | "oz",
    weight: Number(sku.package_details?.weight ?? 0),
    distance_unit: (sku.package_details?.distance_unit ?? "cm") as "cm" | "in" | "ft" | "m" | "mm" | "yd",
    height: Number(sku.package_details?.height ?? 0),
    length: Number(sku.package_details?.length ?? 0),
    width: Number(sku.package_details?.width ?? 0),
  };

  const inventoryWarehouses = typeof sku.inventory === "object" && sku.inventory?.warehouses?.length
    ? sku.inventory.warehouses.map(w => ({
        warehouse_id: w.warehouse_id,
        on_hand: Number(w.on_hand ?? 0),
        reserved: Number(w.reserved ?? 0),
        reorder_point: Number(w.reorder_point ?? 0),
        restock_level: Number(w.restock_level ?? 0),
        track_inventory: Boolean(w.track_inventory),
      }))
    : null

  return {
    id: sku.id,
    code: sku.code,
    price: typeof sku.price === "string" ? parseFloat(sku.price) : sku.price ?? 0,
    package_details: packageDetails,
    inventory: {
      warehouses: inventoryWarehouses ?? []
    },
    attributes: (sku.attributes || []).map(attr => ({
      type: attr.type,
      variation_value_id: (attr as any).variation_value_id ?? undefined,
      hex_color: attr.hex_color ?? attr.hexColor,
      image: (attr as any).image,
    })),
  };
};

export function ProductForm({ initialData, onSubmit, loading }: ProductFormProps) {
  const { t } = useI18n()
  const isEditMode = !!initialData

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
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(null)
  const [mediaToRemove, setMediaToRemove] = useState<number[]>([])
  const [rangePrice, setRangePrice] = useState({ min_price: "", max_price: "" })
  const [tieredPrices, setTieredPrices] = useState<{ min_quantity: number; price: number }[]>([])
  const [enhancedSkus, setEnhancedSkus] = useState<EnhancedSku[]>([])
  const [removedSkuIds, setRemovedSkuIds] = useState<number[]>([])
  const [content, setContent] = useState<ProductContentBlock | null>(createEmptyContent())
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
        setContent(normalizeContent(draft.content))
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

    // Warehouses are required for non-SKU pricing
    const requiresWarehouseSelection = priceType !== "sku"
    if (requiresWarehouseSelection) {
      if (warehouses.length === 0) {
        newErrors.warehouses = t.atLeastOneWarehouseRequired
      } else if (selectedWarehouseIds.length === 0) {
        newErrors.selectedWarehouses = t.pleaseSelectWarehouse
      }
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
      setIsActive(initialData.is_active)
      setPriceType(initialData.price_type)
      setExistingMedia(initialData.media || [])
      setMediaToRemove([])
      setNewMediaFiles([])
      setRemovedSkuIds([])
      setContent(normalizeContent(initialData.content))
      setExistingVideoUrl(initialData.video || null)

      if (initialData.price_type === "range" && initialData.rangePrices) {
        setRangePrice({ min_price: initialData.rangePrices.minPrice, max_price: initialData.rangePrices.maxPrice })
      }
      if (initialData.price_type === "tiered") {
        const normalizedTieredPrices = (initialData.tieredPrices || []).map(tier => ({
          min_quantity: tier.min_quantity ?? tier.minQuantity ?? 1,
          price: typeof tier.price === "string" ? parseFloat(tier.price) : tier.price ?? 0
        }))
        setTieredPrices(normalizedTieredPrices)
      }

      if (initialData.skus) {
        const normalizedSkus = (initialData.skus || []).map(normalizeSkuFromApi)
        if (initialData.price_type === "sku") {
          setEnhancedSkus(normalizedSkus)
        } else {
          setEnhancedSkus([])
        }

        const derivedWarehouseIds = Array.from(
          new Set(
            normalizedSkus.flatMap(sku =>
              sku.inventory?.warehouses
                ?.map(w => w.warehouse_id)
                .filter((id): id is number => typeof id === "number" && id > 0) || []
            )
          )
        )
        if (derivedWarehouseIds.length > 0) {
          setSelectedWarehouseIds(derivedWarehouseIds)
        }
      } else {
        setEnhancedSkus([])
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
      if (warehouseList.length > 0 && selectedWarehouseIds.length === 0) {
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

  const handleRemoveSku = useCallback((sku: EnhancedSku, index: number) => {
    if (sku?.id) {
      setRemovedSkuIds(prev => (prev.includes(sku.id as number) ? prev : [...prev, sku.id as number]))
    }
    setEnhancedSkus(prev => prev.filter((_, i) => i !== index))
  }, [])

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

    // Send content as FormData array entries (not JSON string)
    // API expects: product[content][0][key]=value format
    if (content) {
      let contentIndex = 0
      
      // Add general info fields
      if (content.general && Object.keys(content.general).length > 0) {
        Object.entries(content.general).forEach(([key, value]) => {
          if (value) {
            fd.append(`product[content][${contentIndex}][type]`, 'general')
            fd.append(`product[content][${contentIndex}][key]`, key)
            fd.append(`product[content][${contentIndex}][value]`, String(value))
            contentIndex++
          }
        })
      }
      
      // Add each specification
      if (content.specifications && content.specifications.length > 0) {
        content.specifications.forEach(spec => {
          if (spec.name || spec.value) {
            fd.append(`product[content][${contentIndex}][type]`, 'specification')
            fd.append(`product[content][${contentIndex}][name]`, spec.name || '')
            fd.append(`product[content][${contentIndex}][value]`, spec.value || '')
            contentIndex++
          }
        })
      }
      
      // Add each shipping method
      if (content.shipping && content.shipping.length > 0) {
        content.shipping.forEach(ship => {
          if (ship.method || ship.time || ship.cost) {
            fd.append(`product[content][${contentIndex}][type]`, 'shipping')
            fd.append(`product[content][${contentIndex}][method]`, ship.method || '')
            fd.append(`product[content][${contentIndex}][time]`, ship.time || '')
            fd.append(`product[content][${contentIndex}][cost]`, ship.cost || '')
            contentIndex++
          }
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

    const ensureWarehouses = (sku: EnhancedSku) => {
      if (sku.inventory?.warehouses && sku.inventory.warehouses.length > 0) {
        return sku.inventory.warehouses
      }
      const fallbackIds = selectedWarehouseIds.length
        ? selectedWarehouseIds
        : (warehouses.length ? [warehouses[0].id] : [])
      return fallbackIds.map(id => ({
        warehouse_id: id,
        on_hand: 0,
        reserved: 0,
        reorder_point: 5,
        restock_level: 20,
        track_inventory: true
      }))
    }

    // Helper function to append SKU to FormData
    // For CREATE: uses flat `skus[index]` structure
    // For UPDATE: uses `skus[add/modify/remove]` structure
    const appendSkuToFormData = (sku: EnhancedSku, skuIndex: number, mode: 'flat' | 'add' | 'modify') => {
      // For create (flat), use skus[index]; for edit use skus[mode][index]
      const prefix = mode === 'flat' ? `skus[${skuIndex}]` : `skus[${mode}][${skuIndex}]`
      
      if (mode === 'modify' && sku.id) {
        fd.append(`${prefix}[id]`, String(sku.id))
      }
      fd.append(`${prefix}[code]`, sku.code || `SKU-${skuIndex}`)
      fd.append(`${prefix}[price]`, String(sku.price ?? 0))

      if (sku.package_details) {
        const pd = sku.package_details
        if (pd.mass_unit) fd.append(`${prefix}[package_details][mass_unit]`, String(pd.mass_unit))
        if (pd.weight !== undefined) fd.append(`${prefix}[package_details][weight]`, String(pd.weight))
        if (pd.distance_unit) fd.append(`${prefix}[package_details][distance_unit]`, String(pd.distance_unit))
        if (pd.height !== undefined) fd.append(`${prefix}[package_details][height]`, String(pd.height))
        if (pd.length !== undefined) fd.append(`${prefix}[package_details][length]`, String(pd.length))
        if (pd.width !== undefined) fd.append(`${prefix}[package_details][width]`, String(pd.width))
      }

      const warehousesPayload = ensureWarehouses(sku)
      warehousesPayload.forEach((w, wIndex) => {
        if (typeof w.warehouse_id === 'number') {
          fd.append(`${prefix}[inventory][warehouses][${wIndex}][warehouse_id]`, String(w.warehouse_id))
          fd.append(`${prefix}[inventory][warehouses][${wIndex}][on_hand]`, String(w.on_hand ?? 0))
          fd.append(`${prefix}[inventory][warehouses][${wIndex}][reserved]`, String(w.reserved ?? 0))
          fd.append(`${prefix}[inventory][warehouses][${wIndex}][reorder_point]`, String(w.reorder_point ?? 0))
          fd.append(`${prefix}[inventory][warehouses][${wIndex}][restock_level]`, String(w.restock_level ?? 0))
          fd.append(`${prefix}[inventory][warehouses][${wIndex}][track_inventory]`, w.track_inventory ? '1' : '0')
        }
      })

      if (sku.attributes && sku.attributes.length > 0) {
        sku.attributes.forEach((attr, attrIndex) => {
          fd.append(`${prefix}[attributes][${attrIndex}][type]`, String(attr.type))
          if (attr.variation_value_id) {
            fd.append(`${prefix}[attributes][${attrIndex}][variation_value_id]`, String(attr.variation_value_id))
          }
          if (attr.hex_color) {
            fd.append(`${prefix}[attributes][${attrIndex}][hex_color]`, String(attr.hex_color))
          }
          if (attr.type === 'image' && attr.image instanceof File) {
            fd.append(`${prefix}[attributes][${attrIndex}][image]`, attr.image)
          }
        })
      }
    }

    // Collect SKUs to process
    const allSkusToProcess: EnhancedSku[] = []

    if (priceType === 'sku') {
      allSkusToProcess.push(...enhancedSkus)
    } else {
      // For range/tiered pricing, create a default SKU
      const fallbackWarehouseIds = selectedWarehouseIds.length
        ? selectedWarehouseIds
        : (warehouses.length ? [warehouses[0].id] : [])
      const defaultPrice = priceType === 'range' 
        ? parseFloat(rangePrice.min_price || '0') 
        : (tieredPrices.length > 0 ? Number(tieredPrices[0].price) : 0)

      const defaultSku: EnhancedSku = {
        code: `SKU-${name.substring(0, 5).replace(/\s+/g, '-').toUpperCase()}-${Date.now()}`,
        price: defaultPrice,
        package_details: {
          mass_unit: 'kg',
          weight: 1,
          distance_unit: 'cm',
          height: 10,
          length: 10,
          width: 10
        },
        inventory: {
          warehouses: fallbackWarehouseIds.map(warehouseId => ({
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
      
      allSkusToProcess.push(defaultSku)
    }

    // For CREATE: use flat skus[] array
    // For EDIT: use skus[add/modify/remove] structure
    if (isEditMode) {
      // Edit mode: separate into add/modify
      const skuAddEntries: EnhancedSku[] = []
      const skuModifyEntries: EnhancedSku[] = []
      
      allSkusToProcess.forEach(sku => {
        if (sku.id) {
          skuModifyEntries.push(sku)
        } else {
          skuAddEntries.push(sku)
        }
      })
      
      skuAddEntries.forEach((sku, index) => appendSkuToFormData(sku, index, 'add'))
      skuModifyEntries.forEach((sku, index) => appendSkuToFormData(sku, index, 'modify'))
      
      if (removedSkuIds.length > 0) {
        removedSkuIds.forEach(id => fd.append('skus[remove][]', String(id)))
      }
    } else {
      // Create mode: use flat skus[] array (as per API spec)
      allSkusToProcess.forEach((sku, index) => appendSkuToFormData(sku, index, 'flat'))
    }

    // Media files
    // For CREATE: use media[] (flat array)
    // For EDIT: use media[add][] and media[remove][]
    if (newMediaFiles.length > 0) {
      if (isEditMode) {
        newMediaFiles.forEach((file) => {
          fd.append('media[add][]', file)
        })
      } else {
        // Create mode: API expects flat media[] array
        newMediaFiles.forEach((file) => {
          fd.append('media[]', file)
        })
      }
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
      console.log('Mode:', isEditMode ? 'EDIT' : 'CREATE')
      console.log('Price Type:', priceType)
      console.log('SKU Count:', allSkusToProcess.length)
      
      // Log all FormData entries for debugging
      const entries: Record<string, any> = {}
      fd.forEach((value, key) => {
        if (value instanceof File) {
          entries[key] = `[File: ${value.name}, ${value.size} bytes]`
        } else {
          entries[key] = value
        }
      })
      console.log('FormData Entries:', entries)
      
      // Show SKU-related keys
      const keys = Object.keys(entries)
      console.log('SKU-related keys:', keys.filter(k => k.startsWith('skus[')))
      console.log('Media-related keys:', keys.filter(k => k.startsWith('media')))
      console.log('Product content:', entries['product[content]'])
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
      case "sku": return (
        <EnhancedSkuManager
          skus={enhancedSkus}
          setSkus={setEnhancedSkus}
          warehouses={selectedWarehouses}
          onRemoveSku={handleRemoveSku}
        />
      )
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
            existingVideoUrl={existingVideoUrl}
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