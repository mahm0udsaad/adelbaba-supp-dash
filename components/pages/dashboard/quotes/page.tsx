"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Eye, AlertCircle, RefreshCw, Calendar, DollarSign, Clock } from "lucide-react"
import Link from "next/link"
import { useApiWithFallback } from "@/hooks/useApiWithFallback"
import { listQuotes, withdrawQuote, type QuoteListItem } from "@/src/services/quotes-api"
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { toast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const statusColors = {
  Submitted: "bg-blue-100 text-blue-800 border-blue-200",
  Withdrawn: "bg-gray-100 text-gray-800 border-gray-200",
  Awarded: "bg-green-100 text-green-800 border-green-200",
  Rejected: "bg-red-100 text-red-800 border-red-200",
}

export default function QuotesPage() {
  const [page, setPage] = useState(1)
  const [language] = useState<"en" | "ar">("en")
  const isArabic = language === "ar"

  const fetchQuotes = useCallback(() => listQuotes({ page }), [page])
  const fallbackQuotes = useCallback(
    async () => ({
      data: [],
      links: {},
      meta: { current_page: 1, last_page: 1, per_page: 15, total: 0, from: null, to: null },
    }),
    []
  )

  const { data: quotesResponse, loading, refetch, setData } = useApiWithFallback({
    fetcher: fetchQuotes,
    fallback: fallbackQuotes,
    deps: [page],
  })

  const handleWithdraw = async (quoteId: number) => {
    try {
      await withdrawQuote(quoteId)
      toast({
        title: isArabic ? "تم السحب" : "Quote Withdrawn",
        description: isArabic ? "تم سحب العرض بنجاح" : "Your quote has been withdrawn successfully",
      })
      
      // Update local state optimistically
      setData((prev: any) => {
        if (!prev) return prev
        return {
          ...prev,
          data: prev.data.map((q: QuoteListItem) =>
            q.id === quoteId ? { ...q, status: "Withdrawn", withdrawn_at: new Date().toISOString() } : q
          ),
        }
      })
    } catch (error: any) {
      console.error("Error withdrawing quote:", error)
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: error?.response?.data?.message || error?.message || (isArabic ? "فشل سحب العرض" : "Failed to withdraw quote"),
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-4 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{isArabic ? "عروضي" : "My Quotes"}</h1>
          <p className="text-muted-foreground">
            {isArabic ? "إدارة جميع عروض الأسعار المقدمة" : "Manage all your submitted quotes"}
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          {isArabic ? "تحديث" : "Refresh"}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isArabic ? "إجمالي العروض" : "Total Quotes"}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotesResponse?.meta?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isArabic ? "قيد المراجعة" : "Submitted"}</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quotesResponse?.data?.filter((q) => q.status === "Submitted").length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isArabic ? "فائزة" : "Awarded"}</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quotesResponse?.data?.filter((q) => q.status === "Awarded").length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isArabic ? "مسحوبة" : "Withdrawn"}</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quotesResponse?.data?.filter((q) => q.status === "Withdrawn").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quotes List */}
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? "جميع العروض" : "All Quotes"}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !quotesResponse || quotesResponse.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">
                {isArabic ? "لا توجد عروض أسعار" : "No quotes yet"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isArabic ? "ابدأ بتقديم عروض أسعار للطلبات المتاحة" : "Start by submitting quotes for available RFQs"}
              </p>
              <Link href="/dashboard/rfq">
                <Button className="mt-4">
                  {isArabic ? "تصفح الطلبات" : "Browse RFQs"}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {quotesResponse.data.map((quote) => (
                <div key={quote.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">
                          {isArabic ? "عرض رقم" : "Quote"} #{quote.id}
                        </h3>
                        <Badge
                          className={
                            statusColors[quote.status as keyof typeof statusColors] ||
                            "bg-gray-100 text-gray-800 border-gray-200"
                          }
                        >
                          {quote.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {isArabic ? "للطلب:" : "For RFQ:"} <span className="font-medium">{quote.rfq.title}</span>
                      </p>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{quote.message}</p>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{quote.currency}</span>
                        </div>
                        {quote.lead_time_days > 0 && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {quote.lead_time_days} {isArabic ? "يوم" : "days"}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(quote.submitted_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Link href={`/dashboard/quotes/${quote.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          {isArabic ? "التفاصيل" : "Details"}
                        </Button>
                      </Link>
                      <Link href={`/dashboard/rfq/${quote.rfq.id}`}>
                        <Button size="sm" variant="outline" className="bg-transparent">
                          <FileText className="h-4 w-4 mr-2" />
                          {isArabic ? "عرض الطلب" : "View RFQ"}
                        </Button>
                      </Link>
                      {quote.status === "Submitted" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <AlertCircle className="h-4 w-4 mr-2" />
                              {isArabic ? "سحب" : "Withdraw"}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {isArabic ? "تأكيد السحب" : "Confirm Withdrawal"}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {isArabic
                                  ? "هل أنت متأكد من سحب هذا العرض؟ لن تتمكن من التراجع عن هذا الإجراء."
                                  : "Are you sure you want to withdraw this quote? This action cannot be undone."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{isArabic ? "إلغاء" : "Cancel"}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleWithdraw(quote.id)}>
                                {isArabic ? "سحب العرض" : "Withdraw Quote"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {quotesResponse.meta && quotesResponse.meta.last_page && quotesResponse.meta.last_page > 1 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={(e) => {
                          e.preventDefault()
                          if ((quotesResponse.meta.current_page || 1) > 1) setPage((p) => p - 1)
                        }}
                        href="#"
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        {quotesResponse.meta.from === null && quotesResponse.meta.to === null
                          ? isArabic
                            ? "لا نتائج"
                            : "No results"
                          : `${quotesResponse.meta.from || 0}-${quotesResponse.meta.to || 0} / ${quotesResponse.meta.total || 0}`}
                      </div>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        onClick={(e) => {
                          e.preventDefault()
                          const current = quotesResponse.meta.current_page || 1
                          const last = quotesResponse.meta.last_page || 1
                          if (current < last) setPage((p) => p + 1)
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
    </div>
  )
}

