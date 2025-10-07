"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Eye, DollarSign, MapPin, Building, Calendar, AlertCircle } from "lucide-react"
import type { RFQListItem } from "@/src/services/rfq-api"

interface RFQDisplay extends RFQListItem {
  buyerCompany: string
  category: string
  targetQty: number
  targetPrice: number
  quotesCount: number
  viewsCount: number
}

const statusColors: Record<string, string> = {
  open: "bg-green-100 text-green-800 border-green-200",
  quoted: "bg-blue-100 text-blue-800 border-blue-200",
  awarded: "bg-purple-100 text-purple-800 border-purple-200",
  closed: "bg-gray-100 text-gray-800 border-gray-200",
  expired: "bg-red-100 text-red-800 border-red-200",
}

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
}

type QuoteSummary = { id: number; status?: string; rfq?: { id?: number } }

export function RFQCard({
  rfq,
  isArabic,
  expiresAt,
  quotesResponse,
  onWithdraw,
}: {
  rfq: RFQDisplay
  isArabic: boolean
  expiresAt?: string
  quotesResponse?: { data?: QuoteSummary[] }
  onWithdraw: (quoteId: number) => Promise<void>
}) {
  const getTimeRemaining = (date?: string) => {
    if (!date) return ""
    const now = new Date()
    const expiry = new Date(date)
    const diff = expiry.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (Number.isNaN(days)) return ""
    if (days < 0) return isArabic ? "منتهي الصلاحية" : "Expired"
    if (days === 0) return isArabic ? "ينتهي اليوم" : "Expires today"
    if (days === 1) return isArabic ? "ينتهي غداً" : "Expires tomorrow"
    return isArabic ? `${days} أيام متبقية` : `${days} days left`
  }

  const userQuote = quotesResponse?.data?.find((q) => q.rfq?.id === Number(rfq.id))

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-foreground">{rfq.title}</h3>
              <Badge className={statusColors[rfq.status as string] || "bg-gray-100 text-gray-800 border-gray-200"}>
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
                  : (rfq.status ? rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1) : "Unknown")}
              </Badge>
              {rfq.priority && (
                <Badge variant="outline" className={priorityColors[rfq.priority as string] || "bg-gray-100 text-gray-600"}>
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
                {rfq.country || "Unknown"}
              </div>
              {expiresAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {getTimeRemaining(expiresAt)}
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{rfq.description || "No description available"}</p>

            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">{isArabic ? "الكمية المطلوبة:" : "Target Qty:"}</span>
                <span className="font-medium ml-1">{rfq.targetQty?.toLocaleString() || "N/A"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{isArabic ? "السعر المستهدف:" : "Target Price:"}</span>
                <span className="font-medium ml-1 text-primary">
                  {rfq.targetPrice ? `$${rfq.targetPrice}/${isArabic ? "قطعة" : "unit"}` : "N/A"}
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
            {rfq.status?.toLowerCase?.() === "open" && (
              userQuote ? (
                userQuote.status === "Submitted" ? (
                  <Button
                    key="withdraw"
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.preventDefault()
                      if (userQuote?.id) onWithdraw(userQuote.id)
                    }}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {isArabic ? "سحب العرض" : "Withdraw Quote"}
                  </Button>
                ) : (
                  <Button key="status" size="sm" variant="outline" disabled className="bg-transparent">
                    <FileText className="h-4 w-4 mr-2" />
                    {isArabic ? `العرض: ${userQuote.status}` : `Quote: ${userQuote.status}`}
                  </Button>
                )
              ) : (
                <Link key="create" href={`/dashboard/rfq/${rfq.id}?action=quote`}>
                  <Button size="sm" variant="outline" className="bg-transparent">
                    <DollarSign className="h-4 w-4 mr-2" />
                    {isArabic ? "تقديم عرض سعر" : "Create Quote"}
                  </Button>
                </Link>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


