"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Building,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  Clock,
  FileText,
  Send,
  ArrowLeft,
  Phone,
  Mail,
  Truck,
  CreditCard,
} from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { getRFQDetails, submitQuote, type RFQ } from "@/src/services/rfq-api"

// Helper function to normalize API data for display
const normalizeRFQDetail = (rfq: RFQ): RFQ & {
  buyerCompany: string;
  buyerContact: { name: string; email: string; phone: string };
  specs: Array<{ key: string; value: string }>;
  targetQty: number;
  targetPrice: number;
  paymentTerms: string;
  deliveryTerms: string;
  leadTimeRequired: number;
  expiresAt: string;
  createdAt: string;
  attachments: string[];
  quotesCount: number;
  viewsCount: number;
} => {
  return {
    ...rfq,
    buyerCompany: rfq.buyer_company || 'Unknown Company',
    buyerContact: {
      name: rfq.buyer_contact?.name || 'Unknown Contact',
      email: rfq.buyer_contact?.email || '',
      phone: rfq.buyer_contact?.phone || '',
    },
    specs: rfq.specifications || [],
    targetQty: rfq.target_qty || 0,
    targetPrice: rfq.target_price || 0,
    paymentTerms: rfq.payment_terms || 'Not specified',
    deliveryTerms: rfq.delivery_terms || 'Not specified',
    leadTimeRequired: rfq.lead_time_required || 0,
    expiresAt: rfq.expires_at || new Date().toISOString(),
    createdAt: rfq.created_at || new Date().toISOString(),
    attachments: rfq.attachments || [],
    quotesCount: rfq.quotes_count || 0,
    viewsCount: rfq.views_count || 0,
  }
}

// Remove mock data - using real API now

export default function RFQDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [rfq, setRfq] = useState<ReturnType<typeof normalizeRFQDetail> | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showQuoteDialog, setShowQuoteDialog] = useState(false)
  const [language] = useState<"en" | "ar">("en")

  const [quoteForm, setQuoteForm] = useState({
    price: "",
    moq: "",
    lead_time: "",
    notes: "",
    attachments: [] as File[],
  })

  const isArabic = language === "ar"
  const showQuoteAction = searchParams.get("action") === "quote"

  useEffect(() => {
    fetchRFQ()
    if (showQuoteAction) {
      setShowQuoteDialog(true)
    }
  }, [params.id])

  const fetchRFQ = async () => {
    try {
      setLoading(true)
      const response = await getRFQDetails(params.id as string)
      const rfqData = 'data' in response ? response.data : response
      
      if (rfqData) {
        setRfq(normalizeRFQDetail(rfqData))
      } else {
        setRfq(null)
      }
    } catch (error) {
      console.error("Failed to fetch RFQ:", error)
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic ? "فشل في تحميل تفاصيل الطلب" : "Failed to load RFQ details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!quoteForm.price) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic ? "السعر مطلوب" : "Price is required",
        variant: "destructive",
      })
      return
    }
    
    setSubmitting(true)

    try {
      await submitQuote({
        rfq_id: String(params.id),
        price: parseFloat(quoteForm.price),
        moq: quoteForm.moq ? parseInt(quoteForm.moq) : undefined,
        lead_time: quoteForm.lead_time,
        notes: quoteForm.notes,
        attachments: quoteForm.attachments,
      })

      toast({
        title: isArabic ? "تم إرسال العرض" : "Quote Submitted",
        description: isArabic ? "تم إرسال عرض السعر بنجاح" : "Your quote has been submitted successfully",
      })

      setShowQuoteDialog(false)
      // Reset form
      setQuoteForm({
        price: "",
        moq: "",
        lead_time: "",
        notes: "",
        attachments: [],
      })
      router.push("/dashboard/rfq")
    } catch (error: any) {
      console.error('Quote submission error:', error)
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: error?.response?.data?.message || error?.message || (isArabic ? "فشل في إرسال العرض" : "Failed to submit quote"),
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!rfq) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-muted-foreground">
          {isArabic ? "لم يتم العثور على الطلب" : "RFQ not found"}
        </h2>
      </div>
    )
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/rfq">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isArabic ? "العودة" : "Back"}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{rfq.title}</h1>
            <p className="text-muted-foreground">RFQ ID: {rfq.id}</p>
          </div>
        </div>

        {rfq.status === "open" && (
          <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
            <DialogTrigger asChild>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                {isArabic ? "قدم عرض سعر" : "Submit Quote"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{isArabic ? "تقديم عرض سعر" : "Submit Quote"}</DialogTitle>
                <DialogDescription>
                  {isArabic ? "املأ التفاصيل أدناه لتقديم عرض السعر" : "Fill in the details below to submit your quote"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmitQuote} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">{isArabic ? "سعر الوحدة" : "Unit Price"} *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={quoteForm.price}
                      onChange={(e) => setQuoteForm({ ...quoteForm, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="moq">{isArabic ? "الحد الأدنى للطلب" : "MOQ"}</Label>
                    <Input
                      id="moq"
                      type="number"
                      placeholder="100"
                      value={quoteForm.moq}
                      onChange={(e) => setQuoteForm({ ...quoteForm, moq: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lead_time">{isArabic ? "مدة التسليم" : "Lead Time"}</Label>
                  <Input
                    id="lead_time"
                    placeholder={isArabic ? "مثال: 15 يوم" : "e.g., 15 days"}
                    value={quoteForm.lead_time}
                    onChange={(e) => setQuoteForm({ ...quoteForm, lead_time: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    {isArabic ? "ادخل مدة التسليم بالأيام مثل '30 يوم'" : "Enter lead time like '30 days' or '2 weeks'"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">{isArabic ? "ملاحظات إضافية" : "Additional Notes"}</Label>
                  <Textarea
                    id="notes"
                    placeholder={isArabic ? "أي معلومات إضافية عن عرضك..." : "Any additional information about your quote..."}
                    value={quoteForm.notes}
                    onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attachments">{isArabic ? "المرفقات" : "Attachments"}</Label>
                  <Input
                    id="attachments"
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      setQuoteForm({ ...quoteForm, attachments: files as File[] })
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    {isArabic ? "الأنواع المدعومة: jpg, png, pdf, doc, docx, xls, xlsx" : "Supported types: jpg, png, pdf, doc, docx, xls, xlsx"}
                  </p>
                </div>

                {/* Display selected files */}
                {quoteForm.attachments.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{isArabic ? "الملفات المختارة:" : "Selected Files:"}</Label>
                    <div className="space-y-1">
                      {quoteForm.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newAttachments = [...quoteForm.attachments]
                              newAttachments.splice(index, 1)
                              setQuoteForm({ ...quoteForm, attachments: newAttachments })
                            }}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowQuoteDialog(false)
                      // Reset form when closing
                      setQuoteForm({
                        price: "",
                        moq: "",
                        lead_time: "",
                        notes: "",
                        attachments: [],
                      })
                    }}
                    disabled={submitting}
                    className="bg-transparent"
                  >
                    {isArabic ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button type="submit" disabled={submitting || !quoteForm.price}>
                    {submitting
                      ? isArabic
                        ? "جاري الإرسال..."
                        : "Submitting..."
                      : isArabic
                        ? "إرسال العرض"
                        : "Submit Quote"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* RFQ Overview */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "تفاصيل الطلب" : "RFQ Details"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <Badge
                  className={`${rfq.status === "open" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                >
                  {rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
                </Badge>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {getTimeRemaining(rfq.expiresAt)}
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {rfq.quotesCount} {isArabic ? "عروض أسعار" : "quotes"}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">{isArabic ? "الوصف" : "Description"}</h4>
                <p className="text-muted-foreground">{rfq.description}</p>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">{isArabic ? "المواصفات المطلوبة" : "Required Specifications"}</h4>
                <div className="grid gap-2 md:grid-cols-2">
                  {rfq.specs.map((spec, index) => (
                    <div key={index} className="flex justify-between p-2 bg-muted rounded">
                      <span className="font-medium">{spec.key}:</span>
                      <span className="text-muted-foreground">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commercial Terms */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "الشروط التجارية" : "Commercial Terms"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{isArabic ? "الكمية المطلوبة" : "Target Quantity"}</p>
                      <p className="text-sm text-muted-foreground">{rfq.targetQty.toLocaleString()} units</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{isArabic ? "السعر المستهدف" : "Target Price"}</p>
                      <p className="text-sm text-muted-foreground">${rfq.targetPrice}/unit</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{isArabic ? "مدة التسليم المطلوبة" : "Required Lead Time"}</p>
                      <p className="text-sm text-muted-foreground">{rfq.leadTimeRequired} days</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{isArabic ? "شروط الدفع" : "Payment Terms"}</p>
                      <p className="text-sm text-muted-foreground">{rfq.paymentTerms}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{isArabic ? "شروط التسليم" : "Delivery Terms"}</p>
                      <p className="text-sm text-muted-foreground">{rfq.deliveryTerms}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{isArabic ? "الوجهة" : "Destination"}</p>
                      <p className="text-sm text-muted-foreground">{rfq.country}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Buyer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                {isArabic ? "معلومات المشتري" : "Buyer Information"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{rfq.buyerCompany}</p>
                <p className="text-sm text-muted-foreground">{rfq.country}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {rfq.buyerContact.email}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {rfq.buyerContact.phone}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RFQ Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {isArabic ? "الجدول الزمني" : "Timeline"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">{isArabic ? "تاريخ النشر" : "Published"}</p>
                <p className="text-sm text-muted-foreground">{new Date(rfq.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium">{isArabic ? "ينتهي في" : "Expires"}</p>
                <p className="text-sm text-muted-foreground">{new Date(rfq.expiresAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          {rfq.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {isArabic ? "المرفقات" : "Attachments"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rfq.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Document {index + 1}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
