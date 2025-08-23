"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Package,
  Search,
  Filter,
  Eye,
  Edit,
  Plus,
  MoreHorizontal,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Archive,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import Image from "next/image"

interface Product {
  id: string
  title: string
  sku: string
  categoryId: string
  category: string
  images: string[]
  description: string
  moq: number
  pricingTiers: Array<{
    minQty: number
    maxQty?: number
    unitPrice: number
  }>
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

const MOCK_PRODUCTS: Product[] = [
  {
    id: "PROD-001",
    title: "Wireless Bluetooth Headphones - Premium Quality",
    sku: "WBH-2024-001",
    categoryId: "electronics",
    category: "Electronics & Electrical",
    images: [
      "/placeholder.svg?height=400&width=400&text=Bluetooth+Headphones+Front",
      "/placeholder.svg?height=400&width=400&text=Bluetooth+Headphones+Side",
      "/placeholder.svg?height=400&width=400&text=Bluetooth+Headphones+Package",
    ],
    description:
      "High-quality wireless Bluetooth headphones with noise cancellation, premium sound quality, and long battery life. Perfect for music lovers and professionals.",
    moq: 50,
    pricingTiers: [
      { minQty: 50, maxQty: 99, unitPrice: 32 },
      { minQty: 100, maxQty: 499, unitPrice: 30 },
      { minQty: 500, maxQty: 999, unitPrice: 28 },
      { minQty: 1000, unitPrice: 25 },
    ],
    sampleAvailable: true,
    samplePrice: 45,
    totalStock: 2500,
    status: "active",
    visibility: "public",
    tags: ["bluetooth", "headphones", "wireless", "premium", "noise-cancellation"],
    leadTimeDays: 15,
    createdAt: "2024-01-10T10:30:00Z",
    views: 1245,
    inquiries: 89,
    orders: 23,
  },
  {
    id: "PROD-002",
    title: "USB-C Charging Cables - Fast Charging",
    sku: "USB-C-001",
    categoryId: "electronics",
    category: "Electronics & Electrical",
    images: [
      "/placeholder.svg?height=400&width=400&text=USB-C+Cable+Black",
      "/placeholder.svg?height=400&width=400&text=USB-C+Cable+White",
      "/placeholder.svg?height=400&width=400&text=USB-C+Cable+Package",
    ],
    description:
      "High-speed USB-C charging cables with fast charging support up to 100W. Durable braided design with reinforced connectors.",
    moq: 100,
    pricingTiers: [
      { minQty: 100, maxQty: 499, unitPrice: 3.5 },
      { minQty: 500, maxQty: 999, unitPrice: 3.0 },
      { minQty: 1000, maxQty: 4999, unitPrice: 2.5 },
      { minQty: 5000, unitPrice: 2.0 },
    ],
    sampleAvailable: true,
    samplePrice: 8,
    totalStock: 11000,
    status: "active",
    visibility: "public",
    tags: ["usb-c", "charging", "cable", "fast-charging", "braided"],
    leadTimeDays: 7,
    createdAt: "2024-01-08T15:45:00Z",
    views: 2156,
    inquiries: 156,
    orders: 45,
  },
  {
    id: "PROD-003",
    title: "Cotton T-Shirts - Premium Combed Cotton",
    sku: "CT-MIX-001",
    categoryId: "textiles",
    category: "Textiles & Apparel",
    images: [
      "/placeholder.svg?height=400&width=400&text=Cotton+T-Shirt+Colors",
      "/placeholder.svg?height=400&width=400&text=Cotton+T-Shirt+White",
      "/placeholder.svg?height=400&width=400&text=Cotton+T-Shirt+Black",
    ],
    description:
      "Premium quality cotton t-shirts made from 100% combed cotton. Soft, comfortable, and durable with excellent color retention.",
    moq: 200,
    pricingTiers: [
      { minQty: 200, maxQty: 499, unitPrice: 9.5 },
      { minQty: 500, maxQty: 999, unitPrice: 8.5 },
      { minQty: 1000, maxQty: 2999, unitPrice: 7.5 },
      { minQty: 3000, unitPrice: 6.5 },
    ],
    sampleAvailable: true,
    samplePrice: 15,
    totalStock: 2600,
    status: "active",
    visibility: "public",
    tags: ["cotton", "t-shirt", "apparel", "comfortable", "premium"],
    leadTimeDays: 25,
    createdAt: "2024-01-05T11:20:00Z",
    views: 1876,
    inquiries: 134,
    orders: 31,
  },
  {
    id: "PROD-004",
    title: "Bluetooth Portable Speakers - Waterproof",
    sku: "BT-SPK-001",
    categoryId: "electronics",
    category: "Electronics & Electrical",
    images: [
      "/placeholder.svg?height=400&width=400&text=Bluetooth+Speaker+Black",
      "/placeholder.svg?height=400&width=400&text=Bluetooth+Speaker+Blue",
      "/placeholder.svg?height=400&width=400&text=Bluetooth+Speaker+Features",
    ],
    description:
      "Compact waterproof Bluetooth speakers with powerful sound, long battery life, and rugged design perfect for outdoor activities.",
    moq: 50,
    pricingTiers: [
      { minQty: 50, maxQty: 99, unitPrice: 28 },
      { minQty: 100, maxQty: 299, unitPrice: 25 },
      { minQty: 300, maxQty: 599, unitPrice: 22 },
      { minQty: 600, unitPrice: 20 },
    ],
    sampleAvailable: true,
    samplePrice: 35,
    totalStock: 1050,
    status: "active",
    visibility: "public",
    tags: ["bluetooth", "speaker", "waterproof", "portable", "outdoor"],
    leadTimeDays: 20,
    createdAt: "2024-01-12T09:15:00Z",
    views: 987,
    inquiries: 67,
    orders: 18,
  },
  {
    id: "PROD-005",
    title: "Stainless Steel Kitchen Utensils Set",
    sku: "SS-KIT-001",
    categoryId: "home-kitchen",
    category: "Home & Kitchen",
    images: [
      "/placeholder.svg?height=400&width=400&text=Kitchen+Utensils+Set",
      "/placeholder.svg?height=400&width=400&text=Kitchen+Utensils+Detail",
      "/placeholder.svg?height=400&width=400&text=Kitchen+Utensils+Package",
    ],
    description:
      "Professional-grade stainless steel kitchen utensils set with ergonomic handles. Dishwasher safe and built to last.",
    moq: 100,
    pricingTiers: [
      { minQty: 100, maxQty: 199, unitPrice: 45 },
      { minQty: 200, maxQty: 499, unitPrice: 40 },
      { minQty: 500, maxQty: 999, unitPrice: 35 },
      { minQty: 1000, unitPrice: 30 },
    ],
    sampleAvailable: true,
    samplePrice: 55,
    totalStock: 450,
    status: "active",
    visibility: "public",
    tags: ["kitchen", "utensils", "stainless-steel", "professional", "gift-set"],
    leadTimeDays: 30,
    createdAt: "2024-01-15T14:30:00Z",
    views: 654,
    inquiries: 45,
    orders: 12,
  },
  {
    id: "PROD-006",
    title: "Solar Panel Mounting Brackets - Heavy Duty",
    sku: "SPM-BRK-001",
    categoryId: "renewable-energy",
    category: "Renewable Energy",
    images: [
      "/placeholder.svg?height=400&width=400&text=Solar+Mounting+Brackets",
      "/placeholder.svg?height=400&width=400&text=Solar+Mounting+Installation",
      "/placeholder.svg?height=400&width=400&text=Solar+Mounting+Components",
    ],
    description:
      "Heavy-duty aluminum mounting brackets for solar panels. Weather-resistant and designed for long-term outdoor use.",
    moq: 50,
    pricingTiers: [
      { minQty: 50, maxQty: 99, unitPrice: 125 },
      { minQty: 100, maxQty: 199, unitPrice: 120 },
      { minQty: 200, maxQty: 499, unitPrice: 115 },
      { minQty: 500, unitPrice: 110 },
    ],
    sampleAvailable: true,
    samplePrice: 150,
    totalStock: 180,
    status: "draft",
    visibility: "private",
    tags: ["solar", "mounting", "brackets", "renewable-energy", "aluminum"],
    leadTimeDays: 45,
    createdAt: "2024-01-20T16:00:00Z",
    views: 234,
    inquiries: 18,
    orders: 3,
  },
]

const statusColors = {
  active: "bg-green-100 text-green-800 border-green-200",
  draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
  archived: "bg-gray-100 text-gray-800 border-gray-200",
}

const visibilityColors = {
  public: "bg-blue-100 text-blue-700",
  private: "bg-gray-100 text-gray-700",
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    category: "all",
  })
  const [language] = useState<"en" | "ar">("en")

  const isArabic = language === "ar"

  useEffect(() => {
    fetchProducts()
  }, [filters])

  const fetchProducts = async () => {
    try {
      setLoading(true)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      let filteredProducts = [...MOCK_PRODUCTS]

      // Apply filters
      if (filters.status !== "all") {
        filteredProducts = filteredProducts.filter((p) => p.status === filters.status)
      }

      if (filters.category !== "all") {
        filteredProducts = filteredProducts.filter((p) => p.categoryId === filters.category)
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredProducts = filteredProducts.filter(
          (p) =>
            p.title.toLowerCase().includes(searchLower) ||
            p.sku.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower) ||
            p.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
        )
      }

      setProducts(filteredProducts)
    } catch (error) {
      console.error("Failed to fetch products:", error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />
      case "draft":
        return <Edit className="h-4 w-4" />
      case "archived":
        return <Archive className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    if (isArabic) {
      switch (status) {
        case "active":
          return "نشط"
        case "draft":
          return "مسودة"
        case "archived":
          return "مؤرشف"
        default:
          return status
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const getLowestPrice = (pricingTiers: Product["pricingTiers"]) => {
    if (!pricingTiers || pricingTiers.length === 0) return 0
    return Math.min(...pricingTiers.map((tier) => tier.unitPrice))
  }

  return (
    <div className="p-4 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{isArabic ? "المنتجات" : "Products"}</h1>
          <p className="text-muted-foreground">
            {isArabic ? "إدارة كتالوج المنتجات والمخزون" : "Manage your product catalog and inventory"}
          </p>
        </div>
        <Link href="/dashboard/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {isArabic ? "إضافة منتج" : "Add Product"}
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isArabic ? "إجمالي المنتجات" : "Total Products"}</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isArabic ? "منتجات نشطة" : "Active Products"}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products?.filter((p) => p.status === "active").length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isArabic ? "مخزون منخفض" : "Low Stock"}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products?.filter((p) => p.totalStock < 100).length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isArabic ? "إجمالي المشاهدات" : "Total Views"}</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products?.reduce((sum, p) => sum + p.views, 0).toLocaleString() || "0"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {isArabic ? "البحث والتصفية" : "Search & Filter"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={isArabic ? "البحث في المنتجات..." : "Search products..."}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>

            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder={isArabic ? "الحالة" : "Status"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isArabic ? "جميع الحالات" : "All Status"}</SelectItem>
                <SelectItem value="active">{isArabic ? "نشط" : "Active"}</SelectItem>
                <SelectItem value="draft">{isArabic ? "مسودة" : "Draft"}</SelectItem>
                <SelectItem value="archived">{isArabic ? "مؤرشف" : "Archived"}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder={isArabic ? "الفئة" : "Category"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isArabic ? "جميع الفئات" : "All Categories"}</SelectItem>
                <SelectItem value="electronics">{isArabic ? "إلكترونيات" : "Electronics"}</SelectItem>
                <SelectItem value="textiles">{isArabic ? "منسوجات" : "Textiles"}</SelectItem>
                <SelectItem value="home-kitchen">{isArabic ? "منزل ومطبخ" : "Home & Kitchen"}</SelectItem>
                <SelectItem value="renewable-energy">{isArabic ? "طاقة متجددة" : "Renewable Energy"}</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={fetchProducts} variant="outline" className="bg-transparent">
              {isArabic ? "تحديث" : "Refresh"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !products || products.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">
                  {isArabic ? "لا توجد منتجات" : "No products found"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {isArabic
                    ? "جرب تغيير معايير البحث أو أضف منتج جديد"
                    : "Try adjusting your search or add a new product"}
                </p>
                <Link href="/dashboard/products/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {isArabic ? "إضافة منتج" : "Add Product"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        ) : (
          products.map((product) => (
        <Card key={product.id} className="hover:shadow-md transition-shadow overflow-hidden border-0 rounded-lg">
        <div className="w-full h-full">
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
            <img
              src={product.images?.[0] || "/placeholder.svg"}
              alt={product.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
            <div className="absolute top-2 right-2 flex gap-1 z-10">
              <Badge className={statusColors[product.status as keyof typeof statusColors]}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(product.status)}
                  {getStatusLabel(product.status)}
                </div>
              </Badge>
              <Badge
                variant="outline"
                className={visibilityColors[product.visibility as keyof typeof visibilityColors]}
              >
                {product.visibility === "public" ? (isArabic ? "عام" : "Public") : isArabic ? "خاص" : "Private"}
              </Badge>
            </div>
          </div>

    <div className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground line-clamp-2 mb-1">{product.title}</h3>
          <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/products/${product.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                {isArabic ? "عرض" : "View"}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/products/${product.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                {isArabic ? "تعديل" : "Edit"}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{isArabic ? "السعر من:" : "Price from:"}</span>
          <span className="font-medium text-primary">${getLowestPrice(product.pricingTiers)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{isArabic ? "الحد الأدنى:" : "MOQ:"}</span>
          <span className="font-medium">{product.moq}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{isArabic ? "المخزون:" : "Stock:"}</span>
          <span
            className={`font-medium ${product.totalStock < 100 ? "text-yellow-600" : "text-green-600"}`}
          >
            {product.totalStock}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
        <span>
          {product.views} {isArabic ? "مشاهدة" : "views"}
        </span>
        <span>
          {product.inquiries} {isArabic ? "استفسار" : "inquiries"}
        </span>
        <span>
          {product.orders} {isArabic ? "طلب" : "orders"}
        </span>
      </div>

      <div className="flex gap-2">
        <Link href={`/dashboard/products/${product.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full bg-transparent">
            <Eye className="h-4 w-4 mr-2" />
            {isArabic ? "عرض" : "View"}
          </Button>
        </Link>
        <Link href={`/dashboard/products/${product.id}/edit`} className="flex-1">
          <Button size="sm" className="w-full">
            <Edit className="h-4 w-4 mr-2" />
            {isArabic ? "تعديل" : "Edit"}
          </Button>
        </Link>
      </div>
    </div>
  </div>
</Card>
          ))
        )}
      </div>
    </div>
  )
}
