"use client"

import { useCallback, useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, Filter, Eye, DollarSign, MapPin, Building, Calendar, TrendingUp, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useApiWithFallback } from "@/hooks/useApiWithFallback"
import { listQuotes, withdrawQuote } from "@/src/services/quotes-api"
import { listMarketRFQs, getDashboardMetrics, type RFQListItem, type RFQFilters } from "@/src/services/rfq-api"
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { toast } from "@/hooks/use-toast"

// Dashboard metrics interface
interface DashboardMetrics {
  openRFQs: number
  quotesSubmitted: number
  awarded: number
  winRate: number
}

// Helper function to normalize API data to display format
const normalizeRFQ = (rfq: RFQListItem): RFQListItem & { 
  buyerCompany: string;
  category: string;
  targetQty: number;
  targetPrice: number;
  quotesCount: number;
  viewsCount: number;
} => {
  return {
    ...rfq,
    buyerCompany: rfq.buyer_company || 'Unknown Company',
    category: rfq.category || 'Uncategorized', 
    targetQty: rfq.target_qty || 0,
    targetPrice: rfq.target_price || 0,
    quotesCount: rfq.quotes_count || 0,
    viewsCount: rfq.views_count || 0,
  }
}

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
  // State for filters and pagination
  const [filters, setFilters] = useState<RFQFilters & { match: boolean }>({
    q: "",
    status: "", // empty means all
    category_id: "", // empty means all
    page: 1,
    per_page: 10,
    match: true,
  })
  const [language] = useState<"en" | "ar">("en")
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({
    openRFQs: 0,
    quotesSubmitted: 0,
    awarded: 0,
    winRate: 0
  })
  const [metricsLoading, setMetricsLoading] = useState(false)

  const isArabic = language === "ar"

  // Fetch dashboard metrics
  const fetchDashboardMetrics = useCallback(async () => {
    setMetricsLoading(true)
    try {
      const metrics = await getDashboardMetrics()
      setDashboardMetrics(metrics)
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error)
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic ? "فشل في تحميل إحصائيات لوحة التحكم" : "Failed to load dashboard metrics",
        variant: "destructive",
      })
    } finally {
      setMetricsLoading(false)
    }
  }, [isArabic])

  // Load metrics on component mount
  useEffect(() => {
    fetchDashboardMetrics()
  }, [])

  // RFQ listing (API)
  const fetchRFQs = useCallback(() => {
    const apiFilters: RFQFilters = {
      page: filters.page,
      per_page: filters.per_page,
    }
    
    if (filters.q?.trim()) apiFilters.q = filters.q.trim()
    if (filters.status) apiFilters.status = filters.status
    if (filters.category_id) apiFilters.category_id = filters.category_id
    
    return listMarketRFQs(apiFilters)
  }, [filters])
  
  const fallbackRFQs = useCallback(
    async () => ({
      data: [],
      links: {},
      meta: { current_page: 1, last_page: 1, per_page: 10, total: 0, from: null, to: null },
    }),
    []
  )
  
  const { data: rfqResponse, loading: rfqLoading, refetch: refetchRFQs } = useApiWithFallback({
    fetcher: fetchRFQs,
    fallback: fallbackRFQs,
    deps: [filters],
  })

  // Quotes listing (API)
  const [quotesPage, setQuotesPage] = useState<number>(1)
  const fetchQuotes = useCallback(() => listQuotes({ page: quotesPage }), [quotesPage])
  const fallbackQuotes = useCallback(
    async () => ({
      data: [],
      links: {},
      meta: { current_page: 1, last_page: 1, per_page: 15, total: 0, from: null, to: null },
    }),
    []
  )
  const { data: quotesResponse, loading: quotesLoading, refetch: refetchQuotes, setData: setQuotesResponse } = useApiWithFallback({
    fetcher: fetchQuotes,
    fallback: fallbackQuotes,
    deps: [quotesPage],
  })

  // Process RFQ data from API
  const processedRFQs = useMemo(() => {
    if (!rfqResponse || !rfqResponse.data) return []
    return rfqResponse.data.map(normalizeRFQ)
  }, [rfqResponse])

  // Handle filter changes - this will trigger API refetch
  const handleFilterChange = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ 
      ...prev, 
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1 // Reset to page 1 for new filters
    }))
  }, [])

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

  // Refresh quotes when a new quote is submitted
  const handleQuoteSubmitted = useCallback(() => {
    refetchQuotes()
    fetchDashboardMetrics() // Also refresh metrics
  }, [refetchQuotes, fetchDashboardMetrics])

  return (
    <div className="p-4 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{isArabic ? "طلبات الأسعار" : "RFQs"}</h1>
        <p className="text-muted-foreground">
          {isArabic ? "تصفح وقدم عروض أسعار للطلبات المتاحة" : "Browse and submit quotes for available requests"}
        </p>
      </div>

      {/* My Quotes (from API) */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>{isArabic ? "عروضي" : "My Quotes"}</CardTitle>
        </CardHeader>
        <CardContent>
          {quotesLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : !quotesResponse || (Array.isArray(quotesResponse.data) && quotesResponse.data.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-6">
              <FileText className="h-10 w-10 text-muted-foreground mb-2" />
              <div className="text-sm text-muted-foreground">
                {isArabic ? "لا توجد عروض حتى الآن" : "No quotes yet"}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Quotes list */}
              <div className="grid gap-3">
                {quotesResponse.data.map((q: any) => (
                  <div key={q.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-medium">#{q.id}</span>
                      {q.status && (
                        <Badge variant="outline">{q.status}</Badge>
                      )}
                      {q.currency && (
                        <span className="text-muted-foreground">{q.currency}</span>
                      )}
                      {q.created_at && (
                        <span className="text-muted-foreground">{new Date(q.created_at).toLocaleDateString()}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/rfq/${q.rfq_id || ""}`}>
                        <Button size="sm" variant="outline" className="bg-transparent">
                          <Eye className="h-4 w-4 mr-2" />
                          {isArabic ? "عرض الطلب" : "View RFQ"}
                        </Button>
                      </Link>
                      {q.status !== "withdrawn" && q.status !== "awarded" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            try {
                              await withdrawQuote(q.id)
                              toast({ 
                                title: isArabic ? "تم السحب" : "Withdrawn", 
                                description: isArabic ? "تم سحب العرض بنجاح" : "Quote withdrawn successfully" 
                              })
                              // Optimistic update and refresh metrics
                              setQuotesResponse((prev: any) => {
                                if (!prev) return prev
                                const next = { ...prev, data: prev.data.map((it: any) => (it.id === q.id ? { ...it, status: "withdrawn" } : it)) }
                                return next
                              })
                              // Refresh dashboard metrics
                              fetchDashboardMetrics()
                            } catch (err: any) {
                              console.error('Error withdrawing quote:', err)
                              toast({ 
                                title: isArabic ? "خطأ" : "Error", 
                                description: err?.response?.data?.message || err?.message || (isArabic ? "فشل سحب العرض" : "Failed to withdraw quote"), 
                                variant: "destructive" 
                              })
                            }
                          }}
                          disabled={metricsLoading}
                        >
                          {isArabic ? "سحب" : "Withdraw"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {quotesResponse.meta && quotesResponse.meta.last_page && quotesResponse.meta.last_page > 1 && (
                <Pagination className="mt-2">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={(e) => {
                          e.preventDefault()
                          if ((quotesResponse.meta.current_page || 1) > 1) setQuotesPage((p) => p - 1)
                        }}
                        href="#"
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        {(quotesResponse.meta.from ?? 0) === null && (quotesResponse.meta.to ?? 0) === null
                          ? isArabic
                            ? "لا نتائج"
                            : "No results"
                          : `${quotesResponse.meta.from ?? 0}-${quotesResponse.meta.to ?? 0} / ${quotesResponse.meta.total ?? 0}`}
                      </div>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        onClick={(e) => {
                          e.preventDefault()
                          const current = quotesResponse.meta.current_page || 1
                          const last = quotesResponse.meta.last_page || 1
                          if (current < last) setQuotesPage((p) => p + 1)
                        }}
                        href="#"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isArabic ? "طلبات مفتوحة" : "Open RFQs"}</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                {metricsLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                ) : (
                  dashboardMetrics.openRFQs
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={fetchDashboardMetrics}
                disabled={metricsLoading}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className={`h-3 w-3 ${metricsLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isArabic ? "عروض مقدمة" : "Quotes Submitted"}</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              ) : (
                dashboardMetrics.quotesSubmitted
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isArabic ? "طلبات فائزة" : "Awarded"}</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              ) : (
                dashboardMetrics.awarded
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isArabic ? "معدل الفوز" : "Win Rate"}</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              ) : (
                `${dashboardMetrics.winRate}%`
              )}
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
                placeholder={isArabic ? "البحث في الطلبات..." : "Search RFQs..."}
                value={filters.q || ""}
                onChange={(e) => handleFilterChange({ q: e.target.value })}
                className="pl-10"
              />
            </div>

            <Select value={filters.status || "all"} onValueChange={(value) => handleFilterChange({ status: value === "all" ? "" : value })}>
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

            <Select value={filters.category_id || "all"} onValueChange={(value) => handleFilterChange({ category_id: value === "all" ? "" : value })}>
              <SelectTrigger>
                <SelectValue placeholder={isArabic ? "الفئة" : "Category"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isArabic ? "جميع الفئات" : "All Categories"}</SelectItem>
                <SelectItem value="1">{isArabic ? "إلكترونيات" : "Electronics"}</SelectItem>
                <SelectItem value="2">{isArabic ? "منسوجات" : "Textiles"}</SelectItem>
                <SelectItem value="3">{isArabic ? "منزل ومطبخ" : "Home & Kitchen"}</SelectItem>
                <SelectItem value="4">{isArabic ? "مواد البناء" : "Construction"}</SelectItem>
                <SelectItem value="5">{isArabic ? "تعبئة وتغليف" : "Packaging"}</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={filters.match ? "default" : "outline"}
              onClick={() => handleFilterChange({ match: !filters.match })}
              className="bg-transparent"
            >
              {isArabic ? "طلبات مناسبة فقط" : "Matching Only"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* RFQ List */}
      <div className="space-y-4">
        {rfqLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : processedRFQs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">
                {isArabic ? "لا توجد طلبات أسعار" : "No RFQs found"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isArabic ? "جرب تغيير معايير البحث" : "Try adjusting your search criteria"}
              </p>
              <Button 
                onClick={() => refetchRFQs()} 
                variant="outline" 
                className="mt-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {isArabic ? "إعادة تحميل" : "Refresh"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          processedRFQs.map((rfq) => {
            const expiresAt = rfq.expires_at;
            return (
            <Card key={rfq.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{rfq.title}</h3>
                        <Badge className={statusColors[rfq.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800 border-gray-200"}>
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
                            : (rfq.status ? rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1) : 'Unknown')}
                      </Badge>
                        {rfq.priority && (
                          <Badge variant="outline" className={priorityColors[rfq.priority as keyof typeof priorityColors] || "bg-gray-100 text-gray-600"}>
                        {isArabic
                          ? rfq.priority === "high"
                            ? "عالي"
                            : rfq.priority === "medium"
                              ? "متوسط"
                              : "منخفض"
                          : rfq.priority.charAt(0).toUpperCase() + rfq.priority.slice(1)}
                      </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {rfq.buyerCompany}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                          {rfq.country || 'Unknown'}
                      </div>
                        {expiresAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                            {getTimeRemaining(expiresAt)}
                          </div>
                        )}
                    </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{rfq.description || 'No description available'}</p>

                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">{isArabic ? "الكمية المطلوبة:" : "Target Qty:"}</span>
                          <span className="font-medium ml-1">{rfq.targetQty?.toLocaleString() || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{isArabic ? "السعر المستهدف:" : "Target Price:"}</span>
                        <span className="font-medium ml-1 text-primary">
                            {rfq.targetPrice ? `$${rfq.targetPrice}/${isArabic ? "قطعة" : "unit"}` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{isArabic ? "عروض الأسعار:" : "Quotes:"}</span>
                          <span className="font-medium ml-1">{rfq.quotesCount || 0}</span>
                        </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                      <Link href={`/dashboard/rfq/${rfq.id}`}>
                      <Button size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        {isArabic ? "عرض التفاصيل" : "View Details"}
                      </Button>
                    </Link>
                    {rfq.status === "open" && (
                        <Link href={`/dashboard/rfq/${rfq.id}?action=quote`}>
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
            )
          })
        )}
        
        {/* Pagination for RFQs */}
        {rfqResponse && rfqResponse.meta && rfqResponse.meta.last_page && rfqResponse.meta.last_page > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={(e) => {
                    e.preventDefault()
                    const currentPage = rfqResponse.meta?.current_page || 1
                    if (currentPage > 1) {
                      handleFilterChange({ page: currentPage - 1 })
                    }
                  }}
                  href="#"
                />
              </PaginationItem>
              <PaginationItem>
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  {rfqResponse.meta.from === null && rfqResponse.meta.to === null
                    ? isArabic
                      ? "لا نتائج"
                      : "No results"
                    : `${rfqResponse.meta.from || 0}-${rfqResponse.meta.to || 0} / ${rfqResponse.meta.total || 0}`}
                </div>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={(e) => {
                    e.preventDefault()
                    const currentPage = rfqResponse.meta?.current_page || 1
                    const lastPage = rfqResponse.meta?.last_page || 1
                    if (currentPage < lastPage) {
                      handleFilterChange({ page: currentPage + 1 })
                    }
                  }}
                  href="#"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  )
}
