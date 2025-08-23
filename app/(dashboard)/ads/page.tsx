"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Plus, Play, Pause, Eye, MousePointer, TrendingUp, DollarSign, Target, Calendar, BarChart3 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Ad {
  id: string
  title: string
  productId: string
  productName: string
  type: string
  status: "active" | "paused" | "completed"
  budget: number
  spent: number
  impressions: number
  clicks: number
  conversions: number
  ctr: number
  cpc: number
  startDate: string
  endDate: string
  targetCountries: string[]
  targetKeywords: string[]
}

const MOCK_ADS: Ad[] = [
  {
    id: "1",
    title: "Premium Wireless Headphones Campaign",
    productId: "1",
    productName: "Wireless Bluetooth Headphones",
    type: "product",
    status: "active",
    budget: 5000,
    spent: 3250,
    impressions: 125000,
    clicks: 3750,
    conversions: 187,
    ctr: 3.0,
    cpc: 0.87,
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    targetCountries: ["USA", "Canada", "UK"],
    targetKeywords: ["wireless headphones", "bluetooth audio", "premium sound"],
  },
  {
    id: "2",
    title: "Smart Watch Holiday Sale",
    productId: "2",
    productName: "Smart Fitness Watch",
    type: "product",
    status: "paused",
    budget: 3000,
    spent: 1850,
    impressions: 89000,
    clicks: 2670,
    conversions: 134,
    ctr: 3.0,
    cpc: 0.69,
    startDate: "2024-01-01",
    endDate: "2024-01-31",
    targetCountries: ["USA", "Germany", "France"],
    targetKeywords: ["smart watch", "fitness tracker", "health monitor"],
  },
  {
    id: "3",
    title: "Power Bank Back to School",
    productId: "3",
    productName: "Portable Power Bank",
    type: "product",
    status: "completed",
    budget: 2500,
    spent: 2500,
    impressions: 67000,
    clicks: 2010,
    conversions: 101,
    ctr: 3.0,
    cpc: 1.24,
    startDate: "2023-12-01",
    endDate: "2023-12-31",
    targetCountries: ["USA", "UK", "Australia"],
    targetKeywords: ["power bank", "portable charger", "mobile battery"],
  },
  {
    id: "4",
    title: "Gaming Accessories Promotion",
    productId: "4",
    productName: "Gaming Mouse Pad",
    type: "product",
    status: "active",
    budget: 1500,
    spent: 750,
    impressions: 45000,
    clicks: 1350,
    conversions: 68,
    ctr: 3.0,
    cpc: 0.56,
    startDate: "2024-01-20",
    endDate: "2024-02-20",
    targetCountries: ["USA", "Japan", "South Korea"],
    targetKeywords: ["gaming mouse pad", "gaming accessories", "esports gear"],
  },
]

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [language] = useState<"en" | "ar">("en")

  const [newAd, setNewAd] = useState({
    title: "",
    productId: "",
    budget: "",
    startDate: "",
    endDate: "",
    targetCountries: "",
    targetKeywords: "",
  })

  const isArabic = language === "ar"

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      const filteredAds = statusFilter === "all" ? MOCK_ADS : MOCK_ADS.filter((ad) => ad.status === statusFilter)
      setAds(filteredAds)
      setLoading(false)
    }, 500)
  }, [statusFilter])

  const handleCreateAd = async () => {
    try {
      const adData = {
        id: String(Date.now()),
        title: newAd.title,
        productId: newAd.productId,
        productName: "New Product",
        budget: Number.parseFloat(newAd.budget),
        spent: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        ctr: 0,
        cpc: 0,
        startDate: newAd.startDate,
        endDate: newAd.endDate,
        targetCountries: newAd.targetCountries.split(",").map((c) => c.trim()),
        targetKeywords: newAd.targetKeywords.split(",").map((k) => k.trim()),
        type: "product",
        status: "active" as const,
      }

      // Add to mock data
      setAds((prev) => [adData, ...prev])

      toast({
        title: isArabic ? "تم إنشاء الإعلان" : "Ad Created",
        description: isArabic ? "تم إنشاء حملة الإعلان بنجاح" : "Ad campaign has been created successfully",
      })

      setShowCreateDialog(false)
      setNewAd({
        title: "",
        productId: "",
        budget: "",
        startDate: "",
        endDate: "",
        targetCountries: "",
        targetKeywords: "",
      })
    } catch (error) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic ? "فشل في إنشاء الإعلان" : "Failed to create ad campaign",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isArabic ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{isArabic ? "إدارة الإعلانات" : "Ad Management"}</h1>
          <p className="text-muted-foreground">
            {isArabic ? "قم بترويج منتجاتك وزيادة المبيعات" : "Promote your products and boost sales"}
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {isArabic ? "إنشاء إعلان" : "Create Ad"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{isArabic ? "إنشاء حملة إعلانية جديدة" : "Create New Ad Campaign"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{isArabic ? "عنوان الحملة" : "Campaign Title"} *</Label>
                <Input
                  id="title"
                  value={newAd.title}
                  onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productId">{isArabic ? "المنتج" : "Product"} *</Label>
                <Select value={newAd.productId} onValueChange={(value) => setNewAd({ ...newAd, productId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={isArabic ? "اختر المنتج" : "Select product"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Wireless Bluetooth Headphones</SelectItem>
                    <SelectItem value="2">Smart Fitness Watch</SelectItem>
                    <SelectItem value="3">Portable Power Bank</SelectItem>
                    <SelectItem value="4">Gaming Mouse Pad</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">{isArabic ? "الميزانية ($)" : "Budget ($)"} *</Label>
                <Input
                  id="budget"
                  type="number"
                  value={newAd.budget}
                  onChange={(e) => setNewAd({ ...newAd, budget: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">{isArabic ? "تاريخ البداية" : "Start Date"} *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newAd.startDate}
                    onChange={(e) => setNewAd({ ...newAd, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">{isArabic ? "تاريخ النهاية" : "End Date"} *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newAd.endDate}
                    onChange={(e) => setNewAd({ ...newAd, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetCountries">{isArabic ? "البلدان المستهدفة" : "Target Countries"}</Label>
                <Input
                  id="targetCountries"
                  placeholder={isArabic ? "مثال: USA, UK, Germany" : "e.g., USA, UK, Germany"}
                  value={newAd.targetCountries}
                  onChange={(e) => setNewAd({ ...newAd, targetCountries: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetKeywords">{isArabic ? "الكلمات المفتاحية" : "Target Keywords"}</Label>
                <Textarea
                  id="targetKeywords"
                  placeholder={
                    isArabic ? "مثال: wireless headphones, bluetooth" : "e.g., wireless headphones, bluetooth"
                  }
                  value={newAd.targetKeywords}
                  onChange={(e) => setNewAd({ ...newAd, targetKeywords: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateAd} className="flex-1">
                  {isArabic ? "إنشاء الحملة" : "Create Campaign"}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="bg-transparent">
                  {isArabic ? "إلغاء" : "Cancel"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isArabic ? "جميع الحالات" : "All Status"}</SelectItem>
            <SelectItem value="active">{isArabic ? "نشط" : "Active"}</SelectItem>
            <SelectItem value="paused">{isArabic ? "متوقف" : "Paused"}</SelectItem>
            <SelectItem value="completed">{isArabic ? "مكتمل" : "Completed"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ads List */}
      {loading ? (
        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6">
          {ads.map((ad) => (
            <Card key={ad.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{ad.title}</CardTitle>
                    <p className="text-muted-foreground">{ad.productName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(ad.status)}>
                      {isArabic
                        ? ad.status === "active"
                          ? "نشط"
                          : ad.status === "paused"
                            ? "متوقف"
                            : "مكتمل"
                        : ad.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      {ad.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Budget Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{isArabic ? "الميزانية المستخدمة" : "Budget Used"}</span>
                    <span>
                      ${ad.spent.toFixed(2)} / ${ad.budget.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={(ad.spent / ad.budget) * 100} className="h-2" />
                </div>

                {/* Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{ad.impressions.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{isArabic ? "مشاهدات" : "Impressions"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MousePointer className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{ad.clicks.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{isArabic ? "نقرات" : "Clicks"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{ad.conversions}</p>
                      <p className="text-xs text-muted-foreground">{isArabic ? "تحويلات" : "Conversions"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{ad.ctr.toFixed(2)}%</p>
                      <p className="text-xs text-muted-foreground">CTR</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">${ad.cpc.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">CPC</p>
                    </div>
                  </div>
                </div>

                {/* Campaign Details */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(ad.startDate)} - {formatDate(ad.endDate)}
                    </div>
                    <div>{ad.targetCountries.join(", ")}</div>
                  </div>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {isArabic ? "التفاصيل" : "Details"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {ads.length === 0 && !loading && (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">{isArabic ? "لا توجد إعلانات" : "No ads found"}</h3>
                <p className="text-muted-foreground mb-4">
                  {isArabic
                    ? "ابدأ بإنشاء حملة إعلانية لترويج منتجاتك"
                    : "Start by creating an ad campaign to promote your products"}
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isArabic ? "إنشاء إعلان" : "Create Ad"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
