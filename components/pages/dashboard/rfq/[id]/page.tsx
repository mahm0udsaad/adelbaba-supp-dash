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
import { createQuote } from "@/src/services/quotes-api"

interface RFQ {
  id: string
  title: string
  buyerCompany: string
  buyerContact: {
    name: string
    email: string
    phone: string
  }
  categoryId: string
  category: string
  description: string
  specs: Array<{ key: string; value: string }>
  targetQty: number
  targetPrice: number
  currency: string
  countryCode: string
  country: string
  paymentTerms: string
  deliveryTerms: string
  leadTimeRequired: number
  status: string
  priority: string
  expiresAt: string
  createdAt: string
  attachments: string[]
  quotesCount: number
  viewsCount: number
}

const MOCK_RFQ_DETAILS = {
  "rfq-001": {
    id: "rfq-001",
    title: "High-Quality Steel Pipes for Construction Project",
    buyerCompany: "BuildTech Construction Ltd",
    buyerContact: {
      name: "Ahmed Hassan",
      email: "ahmed.hassan@buildtech.com",
      phone: "+971-50-123-4567",
    },
    categoryId: "construction",
    category: "Construction Materials",
    description:
      "We are looking for high-quality steel pipes for a major construction project in Dubai. The pipes will be used for structural support and must meet international quality standards. We need reliable suppliers who can provide consistent quality and timely delivery.",
    specs: [
      { key: "Material", value: "Carbon Steel" },
      { key: "Diameter", value: "50mm - 200mm" },
      { key: "Wall Thickness", value: "3mm - 8mm" },
      { key: "Length", value: "6m - 12m" },
      { key: "Standard", value: "ASTM A53" },
      { key: "Surface Treatment", value: "Galvanized" },
    ],
    targetQty: 5000,
    targetPrice: 25.5,
    currency: "USD",
    countryCode: "AE",
    country: "United Arab Emirates",
    paymentTerms: "30% advance, 70% before shipment",
    deliveryTerms: "FOB Dubai",
    leadTimeRequired: 45,
    status: "open",
    priority: "high",
    expiresAt: "2024-12-15T23:59:59Z",
    createdAt: "2024-11-01T10:00:00Z",
    attachments: ["technical_specs.pdf", "project_drawings.dwg"],
    quotesCount: 12,
    viewsCount: 156,
  },
  "rfq-002": {
    id: "rfq-002",
    title: "Organic Cotton T-Shirts for Fashion Brand",
    buyerCompany: "EcoFashion International",
    buyerContact: {
      name: "Sarah Johnson",
      email: "sarah@ecofashion.com",
      phone: "+1-555-0123",
    },
    categoryId: "textiles",
    category: "Textiles & Apparel",
    description:
      "Looking for a reliable manufacturer to produce organic cotton t-shirts for our sustainable fashion line. We need high-quality materials and ethical manufacturing practices.",
    specs: [
      { key: "Material", value: "100% Organic Cotton" },
      { key: "Weight", value: "180 GSM" },
      { key: "Sizes", value: "XS to XXL" },
      { key: "Colors", value: "White, Black, Navy, Gray" },
      { key: "Certification", value: "GOTS Certified" },
      { key: "Printing", value: "Water-based inks only" },
    ],
    targetQty: 10000,
    targetPrice: 8.5,
    currency: "USD",
    countryCode: "US",
    country: "United States",
    paymentTerms: "50% advance, 50% on delivery",
    deliveryTerms: "FOB Shanghai",
    leadTimeRequired: 60,
    status: "open",
    priority: "medium",
    expiresAt: "2024-12-20T23:59:59Z",
    createdAt: "2024-11-05T14:30:00Z",
    attachments: ["size_chart.pdf", "color_swatches.jpg"],
    quotesCount: 8,
    viewsCount: 89,
  },
  "rfq-003": {
    id: "rfq-003",
    title: "Industrial LED Lighting Systems",
    buyerCompany: "MegaFactory Solutions",
    buyerContact: {
      name: "Liu Wei",
      email: "liu.wei@megafactory.cn",
      phone: "+86-138-0013-8000",
    },
    categoryId: "electronics",
    category: "Electronics & Electrical",
    description:
      "Need industrial-grade LED lighting systems for warehouse and factory installations. Must be energy-efficient and have long lifespan.",
    specs: [
      { key: "Power", value: "100W - 200W" },
      { key: "Voltage", value: "AC 85-265V" },
      { key: "Luminous Flux", value: "≥130 lm/W" },
      { key: "Color Temperature", value: "5000K - 6500K" },
      { key: "IP Rating", value: "IP65" },
      { key: "Lifespan", value: "≥50,000 hours" },
    ],
    targetQty: 2000,
    targetPrice: 45.0,
    currency: "USD",
    countryCode: "CN",
    country: "China",
    paymentTerms: "T/T 30% advance, 70% before shipment",
    deliveryTerms: "EXW Guangzhou",
    leadTimeRequired: 30,
    status: "open",
    priority: "high",
    expiresAt: "2024-12-10T23:59:59Z",
    createdAt: "2024-10-28T09:15:00Z",
    attachments: ["installation_guide.pdf"],
    quotesCount: 15,
    viewsCount: 203,
  },
}

export default function RFQDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [rfq, setRfq] = useState<RFQ | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showQuoteDialog, setShowQuoteDialog] = useState(false)
  const [language] = useState<"en" | "ar">("en")

  const [quoteForm, setQuoteForm] = useState({
    message: "",
    unitPrice: "",
    currency: "USD",
    moq: "",
    leadTimeDays: "",
    validityDays: "30",
    paymentTerms: "",
    deliveryTerms: "",
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
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      const mockRfq = MOCK_RFQ_DETAILS[params.id as keyof typeof MOCK_RFQ_DETAILS]
      if (mockRfq) {
        setRfq(mockRfq)
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
    setSubmitting(true)

    try {
      await createQuote({
        rfq_id: String(params.id),
        message: quoteForm.message,
        currency: quoteForm.currency,
        lead_time_days: quoteForm.leadTimeDays ? Number(quoteForm.leadTimeDays) : undefined,
        attachments: quoteForm.attachments,
      })

      toast({
        title: isArabic ? "تم إرسال العرض" : "Quote Submitted",
        description: isArabic ? "تم إرسال عرض السعر بنجاح" : "Your quote has been submitted successfully",
      })

      setShowQuoteDialog(false)
      router.push("/dashboard/rfq")
    } catch (error) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic ? "فشل في إرسال العرض" : "Failed to submit quote",
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
                <div className="space-y-2">
                  <Label htmlFor="message">{isArabic ? "رسالة" : "Message"} *</Label>
                  <Textarea
                    id="message"
                    placeholder={isArabic ? "رسالتك إلى المشتري" : "Your message to the buyer"}
                    value={quoteForm.message}
                    onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })}
                    required
                    rows={3}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">{isArabic ? "سعر الوحدة" : "Unit Price"} *</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={quoteForm.unitPrice}
                      onChange={(e) => setQuoteForm({ ...quoteForm, unitPrice: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="moq">{isArabic ? "الحد الأدنى للطلب" : "MOQ"} *</Label>
                    <Input
                      id="moq"
                      type="number"
                      placeholder="100"
                      value={quoteForm.moq}
                      onChange={(e) => setQuoteForm({ ...quoteForm, moq: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">{isArabic ? "العملة" : "Currency"} *</Label>
                    <Input
                      id="currency"
                      placeholder="USD"
                      value={quoteForm.currency}
                      onChange={(e) => setQuoteForm({ ...quoteForm, currency: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leadTimeDays">{isArabic ? "مدة التسليم (أيام)" : "Lead Time (Days)"}</Label>
                    <Input
                      id="leadTimeDays"
                      type="number"
                      placeholder="30"
                      value={quoteForm.leadTimeDays}
                      onChange={(e) => setQuoteForm({ ...quoteForm, leadTimeDays: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="validityDays">{isArabic ? "صالح لمدة (أيام)" : "Validity (Days)"}</Label>
                    <Input
                      id="validityDays"
                      type="number"
                      placeholder="30"
                      value={quoteForm.validityDays}
                      onChange={(e) => setQuoteForm({ ...quoteForm, validityDays: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">{isArabic ? "شروط الدفع" : "Payment Terms"}</Label>
                  <Input
                    id="paymentTerms"
                    placeholder={isArabic ? "مثال: 30% مقدم، 70% قبل الشحن" : "e.g., 30% advance, 70% before shipment"}
                    value={quoteForm.paymentTerms}
                    onChange={(e) => setQuoteForm({ ...quoteForm, paymentTerms: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryTerms">{isArabic ? "شروط التسليم" : "Delivery Terms"}</Label>
                  <Input
                    id="deliveryTerms"
                    placeholder={isArabic ? "مثال: FOB شنغهاي" : "e.g., FOB Shanghai"}
                    value={quoteForm.deliveryTerms}
                    onChange={(e) => setQuoteForm({ ...quoteForm, deliveryTerms: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">{isArabic ? "ملاحظات إضافية" : "Additional Notes"}</Label>
                  <Textarea
                    id="notes"
                    placeholder={isArabic ? "أي معلومات إضافية..." : "Any additional information..."}
                    value={quoteForm.notes}
                    onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                    rows={3}
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

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowQuoteDialog(false)}
                    className="bg-transparent"
                  >
                    {isArabic ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button type="submit" disabled={submitting}>
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
