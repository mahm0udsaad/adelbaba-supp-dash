"use client"

import { useMemo, useState } from "react"
import { useMockData } from "@/lib/mock-data-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, Filter, Eye, DollarSign, MapPin, Building, Calendar, TrendingUp } from "lucide-react"
import Link from "next/link"

interface RFQ {
  id: string
  title: string
  buyerCompany: string
  categoryId: string
  category: string
  description: string
  targetQty: number
  targetPrice: number
  currency: string
  countryCode: string
  country: string
  status: "open" | "quoted" | "awarded" | "closed" | "expired"
  priority: "low" | "medium" | "high"
  expiresAt: string
  createdAt: string
  quotesCount: number
  viewsCount: number
}

const MOCK_RFQS: RFQ[] = [
  {
    id: "rfq-001",
    title: "High-Quality Bluetooth Headphones - Bulk Order",
    buyerCompany: "TechSound Electronics",
    categoryId: "electronics",
    category: "Electronics",
    description:
      "Looking for premium wireless Bluetooth headphones with noise cancellation feature. Need OEM/ODM services with custom branding. Target market is North America and Europe.",
    targetQty: 5000,
    targetPrice: 25.5,
    currency: "USD",
    countryCode: "US",
    country: "United States",
    status: "open",
    priority: "high",
    expiresAt: "2024-09-15T23:59:59Z",
    createdAt: "2024-08-20T10:30:00Z",
    quotesCount: 12,
    viewsCount: 156,
  },
  {
    id: "rfq-002",
    title: "Cotton T-Shirts for Fashion Brand",
    buyerCompany: "Urban Style Co.",
    categoryId: "textiles",
    category: "Textiles",
    description:
      "Seeking manufacturer for 100% organic cotton t-shirts. Various sizes and colors needed. Must comply with GOTS certification standards.",
    targetQty: 10000,
    targetPrice: 8.75,
    currency: "USD",
    countryCode: "CA",
    country: "Canada",
    status: "quoted",
    priority: "medium",
    expiresAt: "2024-09-20T23:59:59Z",
    createdAt: "2024-08-18T14:20:00Z",
    quotesCount: 8,
    viewsCount: 89,
  },
  {
    id: "rfq-003",
    title: "Smart Kitchen Appliances Set",
    buyerCompany: "HomeTech Solutions",
    categoryId: "home-kitchen",
    category: "Home & Kitchen",
    description:
      "Looking for smart kitchen appliances including air fryer, blender, and coffee maker with IoT connectivity and mobile app control.",
    targetQty: 2000,
    targetPrice: 150.0,
    currency: "USD",
    countryCode: "GB",
    country: "United Kingdom",
    status: "awarded",
    priority: "high",
    expiresAt: "2024-08-25T23:59:59Z",
    createdAt: "2024-08-15T09:15:00Z",
    quotesCount: 15,
    viewsCount: 203,
  },
  {
    id: "rfq-004",
    title: "LED Strip Lights for Commercial Use",
    buyerCompany: "Bright Solutions Ltd",
    categoryId: "electronics",
    category: "Electronics",
    description:
      "Commercial grade LED strip lights for office and retail spaces. Need IP65 rating and dimming capabilities.",
    targetQty: 8000,
    targetPrice: 12.3,
    currency: "USD",
    countryCode: "AU",
    country: "Australia",
    status: "open",
    priority: "medium",
    expiresAt: "2024-09-30T23:59:59Z",
    createdAt: "2024-08-22T16:45:00Z",
    quotesCount: 6,
    viewsCount: 78,
  },
  {
    id: "rfq-005",
    title: "Eco-Friendly Packaging Materials",
    buyerCompany: "Green Pack Industries",
    categoryId: "packaging",
    category: "Packaging",
    description:
      "Biodegradable packaging materials for food industry. Must be FDA approved and compostable within 90 days.",
    targetQty: 50000,
    targetPrice: 0.45,
    currency: "USD",
    countryCode: "DE",
    country: "Germany",
    status: "expired",
    priority: "low",
    expiresAt: "2024-08-20T23:59:59Z",
    createdAt: "2024-08-10T11:30:00Z",
    quotesCount: 3,
    viewsCount: 45,
  },
]

const statusColors = {
  open: "bg-green-100 text-green-800 border-green-200",
  quoted: "bg-blue-100 text-blue-800 border-blue-200",
  awarded: "bg-purple-100 text-purple-800 border-purple-200",
  closed: "bg-gray-100 text-gray-800 border-gray-200",
  expired: "bg-red-100 text-red-800 border-red-200",
}

const priorityColors = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
}

export default function RFQPage() {
  const { rfqs } = useMockData()
  const [filteredRfqs, setFilteredRfqs] = useState<RFQ[]>(MOCK_RFQS)
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    category: "all",
    match: true,
  })
  const [language] = useState<"en" | "ar">("en")

  const isArabic = language === "ar"

  const filtered = useMemo(() => {
    let filtered = [...(rfqs as RFQ[])]

    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(
        (rfq) =>
          rfq.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          rfq.description.toLowerCase().includes(filters.search.toLowerCase()) ||
          rfq.buyerCompany.toLowerCase().includes(filters.search.toLowerCase()),
      )
    }

    // Apply status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((rfq) => rfq.status === filters.status)
    }

    // Apply category filter
    if (filters.category !== "all") {
      filtered = filtered.filter((rfq) => rfq.categoryId === filters.category)
    }

    // Apply match filter (for demo, just filter high priority items)
    if (filters.match) {
      filtered = filtered.filter((rfq) => rfq.priority === "high" || rfq.priority === "medium")
    }

    return filtered
  }, [rfqs, filters])

  if (filteredRfqs !== filtered) {
    setFilteredRfqs(filtered)
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = expiry.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

    if (days < 0) return isArabic ? "منتهي الصلاحية" : "Expired"
    if (days === 0) return isArabic ? "ينتهي اليوم" : "Expires today"
    if (days === 1) return isArabic ? "ينتهي غداً" : "Expires tomorrow"
    return isArabic ? `${days} أيام متبقية` : `${days} days left`
  }

  return (
    <div className="p-4 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{isArabic ? "طلبات الأسعار" : "RFQs"}</h1>
        <p className="text-muted-foreground">
          {isArabic ? "تصفح وقدم عروض أسعار للطلبات المتاحة" : "Browse and submit quotes for available requests"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isArabic ? "طلبات مفتوحة" : "Open RFQs"}</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rfqs.filter((r) => r.status === "open").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isArabic ? "عروض مقدمة" : "Quotes Submitted"}</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rfqs.filter((r) => r.status === "quoted").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isArabic ? "طلبات فائزة" : "Awarded"}</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rfqs.filter((r) => r.status === "awarded").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isArabic ? "معدل الفوز" : "Win Rate"}</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24%</div>
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
                placeholder={isArabic ? "البحث في الطلبات..." : "Search RFQs..."}
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
                <SelectItem value="open">{isArabic ? "مفتوح" : "Open"}</SelectItem>
                <SelectItem value="quoted">{isArabic ? "تم الرد" : "Quoted"}</SelectItem>
                <SelectItem value="awarded">{isArabic ? "فائز" : "Awarded"}</SelectItem>
                <SelectItem value="expired">{isArabic ? "منتهي" : "Expired"}</SelectItem>
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
              </SelectContent>
            </Select>

            <Button
              variant={filters.match ? "default" : "outline"}
              onClick={() => setFilters({ ...filters, match: !filters.match })}
              className="bg-transparent"
            >
              {isArabic ? "طلبات مناسبة فقط" : "Matching Only"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* RFQ List */}
      <div className="space-y-4">
        {filteredRfqs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">
                {isArabic ? "لا توجد طلبات أسعار" : "No RFQs found"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isArabic ? "جرب تغيير معايير البحث" : "Try adjusting your search criteria"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRfqs.map((rfq) => (
            <Card key={rfq.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{rfq.title}</h3>
                      <Badge className={statusColors[rfq.status]}>
                        {isArabic
                          ? rfq.status === "open"
                            ? "مفتوح"
                            : rfq.status === "quoted"
                              ? "تم الرد"
                              : rfq.status === "awarded"
                                ? "فائز"
                                : rfq.status === "expired"
                                  ? "منتهي"
                                  : "مغلق"
                          : rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
                      </Badge>
                      <Badge variant="outline" className={priorityColors[rfq.priority]}>
                        {isArabic
                          ? rfq.priority === "high"
                            ? "عالي"
                            : rfq.priority === "medium"
                              ? "متوسط"
                              : "منخفض"
                          : rfq.priority.charAt(0).toUpperCase() + rfq.priority.slice(1)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {rfq.buyerCompany}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {rfq.country}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {getTimeRemaining(rfq.expiresAt)}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{rfq.description}</p>

                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">{isArabic ? "الكمية المطلوبة:" : "Target Qty:"}</span>
                        <span className="font-medium ml-1">{rfq.targetQty.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{isArabic ? "السعر المستهدف:" : "Target Price:"}</span>
                        <span className="font-medium ml-1 text-primary">
                          ${rfq.targetPrice}/{isArabic ? "قطعة" : "unit"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{isArabic ? "عروض الأسعار:" : "Quotes:"}</span>
                        <span className="font-medium ml-1">{rfq.quotesCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Link href={`/rfq/${rfq.id}`}>
                      <Button size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        {isArabic ? "عرض التفاصيل" : "View Details"}
                      </Button>
                    </Link>
                    {rfq.status === "open" && (
                      <Link href={`/rfq/${rfq.id}?action=quote`}>
                        <Button size="sm" variant="outline" className="bg-transparent">
                          <DollarSign className="h-4 w-4 mr-2" />
                          {isArabic ? "قدم عرض سعر" : "Submit Quote"}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
