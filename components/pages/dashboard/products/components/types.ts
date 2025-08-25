export interface ProductPricingTier {
  minQty: number
  maxQty?: number
  unitPrice: number
}

export interface Product {
  id: string
  title: string
  sku: string
  categoryId: string
  category: string
  images: string[]
  description: string
  moq: number
  pricingTiers: ProductPricingTier[]
  sampleAvailable: boolean
  samplePrice?: number
  totalStock: number
  status: string
  visibility: string
  tags: string[]
  leadTimeDays: number
  createdAt: string
  views: number
  inquiries: number
  orders: number
}

export interface ProductFiltersState {
  search: string
  status: string
  category: string
}

