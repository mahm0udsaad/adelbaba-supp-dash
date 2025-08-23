"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Crown, CheckCircle, ArrowRight } from "lucide-react"
import apiClient from "@/lib/axios"
import { toast } from "@/hooks/use-toast"

interface MembershipData {
  currentPlan: {
    name: string
    nameAr: string
    level: string
    badge: string
    color: string
    features: string[]
    featuresAr: string[]
    validUntil: string
    progress: number
  }
  plans: Array<{
    id: string
    name: string
    nameAr: string
    level: string
    price: number
    currency: string
    period: string
    periodAr: string
    badge: string
    color: string
    popular: boolean
    features: string[]
    featuresAr: string[]
    benefits: string[]
    benefitsAr: string[]
  }>
  benefits: {
    totalSales: number
    totalOrders: number
    responseRate: number
    customerSatisfaction: number
  }
  achievements: Array<{
    id: string
    title: string
    titleAr: string
    description: string
    descriptionAr: string
    icon: string
    earned: boolean
    progress: number
  }>
}

const mockMembershipData: MembershipData = {
  currentPlan: {
    name: "Gold Supplier",
    nameAr: "مورد ذهبي",
    level: "gold",
    badge: "🥇",
    color: "text-yellow-600",
    features: [
      "Priority customer support",
      "Advanced analytics dashboard",
      "Trade assurance protection",
      "Featured product listings",
      "Custom branding options",
    ],
    featuresAr: [
      "دعم عملاء أولوية",
      "لوحة تحليلات متقدمة",
      "حماية الضمان التجاري",
      "قوائم منتجات مميزة",
      "خيارات العلامة التجارية المخصصة",
    ],
    validUntil: "December 31, 2024",
    progress: 75,
  },
  plans: [
    {
      id: "silver",
      name: "Silver Supplier",
      nameAr: "مورد فضي",
      level: "silver",
      price: 99,
      currency: "USD",
      period: "month",
      periodAr: "شهر",
      badge: "🥈",
      color: "text-gray-500",
      popular: false,
      features: [
        "Enhanced product listings",
        "Priority customer support",
        "Advanced analytics",
        "Up to 200 products",
        "SMS notifications",
        "Basic trade assurance",
      ],
      featuresAr: [
        "قوائم منتجات محسنة",
        "دعم عملاء أولوية",
        "تحليلات متقدمة",
        "حتى 200 منتج",
        "إشعارات SMS",
        "ضمان تجاري أساسي",
      ],
      benefits: ["Enhanced visibility", "Better conversion rates", "Trade protection"],
      benefitsAr: ["رؤية محسنة", "معدلات تحويل أفضل", "حماية تجارية"],
    },
    {
      id: "gold",
      name: "Gold Supplier",
      nameAr: "مورد ذهبي",
      level: "gold",
      price: 199,
      currency: "USD",
      period: "month",
      periodAr: "شهر",
      badge: "🥇",
      color: "text-yellow-600",
      popular: true,
      features: [
        "Premium product listings",
        "24/7 priority support",
        "Advanced analytics dashboard",
        "Unlimited products",
        "Multi-channel notifications",
        "Full trade assurance",
        "Featured placement",
        "Custom branding",
      ],
      featuresAr: [
        "قوائم منتجات مميزة",
        "دعم أولوية 24/7",
        "لوحة تحليلات متقدمة",
        "منتجات غير محدودة",
        "إشعارات متعددة القنوات",
        "ضمان تجاري كامل",
        "موضع مميز",
        "علامة تجارية مخصصة",
      ],
      benefits: ["Maximum visibility", "Highest conversion rates", "Full protection", "Premium branding"],
      benefitsAr: ["أقصى رؤية", "أعلى معدلات التحويل", "حماية كاملة", "علامة تجارية مميزة"],
    },
    {
      id: "diamond",
      name: "Diamond Supplier",
      nameAr: "مورد ماسي",
      level: "diamond",
      price: 399,
      currency: "USD",
      period: "month",
      periodAr: "شهر",
      badge: "💎",
      color: "text-blue-600",
      popular: false,
      features: [
        "Exclusive product listings",
        "Dedicated account manager",
        "Custom analytics reports",
        "Unlimited products",
        "All notification channels",
        "Premium trade assurance",
        "Top featured placement",
        "Full custom branding",
        "API access",
        "White-label solutions",
      ],
      featuresAr: [
        "قوائم منتجات حصرية",
        "مدير حساب مخصص",
        "تقارير تحليلات مخصصة",
        "منتجات غير محدودة",
        "جميع قنوات الإشعار",
        "ضمان تجاري مميز",
        "موضع مميز أعلى",
        "علامة تجارية مخصصة كاملة",
        "وصول API",
        "حلول العلامة البيضاء",
      ],
      benefits: ["Exclusive access", "Personal support", "Custom solutions", "Enterprise features"],
      benefitsAr: ["وصول حصري", "دعم شخصي", "حلول مخصصة", "ميزات المؤسسة"],
    },
  ],
  benefits: {
    totalSales: 284750,
    totalOrders: 410,
    responseRate: 95,
    customerSatisfaction: 4.8,
  },
  achievements: [
    {
      id: "first_sale",
      title: "First Sale",
      titleAr: "أول عملية بيع",
      description: "Complete your first successful transaction",
      descriptionAr: "أكمل أول معاملة ناجحة لك",
      icon: "🎉",
      earned: true,
      progress: 100,
    },
    {
      id: "hundred_orders",
      title: "Century Club",
      titleAr: "نادي المئة",
      description: "Reach 100 completed orders",
      descriptionAr: "الوصول إلى 100 طلب مكتمل",
      icon: "💯",
      earned: true,
      progress: 100,
    },
    {
      id: "customer_favorite",
      title: "Customer Favorite",
      titleAr: "المفضل لدى العملاء",
      description: "Maintain 4.5+ star rating with 50+ reviews",
      descriptionAr: "الحفاظ على تقييم 4.5+ نجوم مع 50+ مراجعة",
      icon: "⭐",
      earned: true,
      progress: 100,
    },
    {
      id: "fast_responder",
      title: "Lightning Fast",
      titleAr: "سريع البرق",
      description: "Maintain 90%+ response rate for 3 months",
      descriptionAr: "الحفاظ على معدل استجابة 90%+ لمدة 3 أشهر",
      icon: "⚡",
      earned: true,
      progress: 100,
    },
    {
      id: "trade_master",
      title: "Trade Master",
      titleAr: "سيد التجارة",
      description: "Complete $100,000 in trade assurance transactions",
      descriptionAr: "إكمال 100,000 دولار في معاملات الضمان التجاري",
      icon: "🏆",
      earned: true,
      progress: 100,
    },
    {
      id: "global_reach",
      title: "Global Reach",
      titleAr: "الوصول العالمي",
      description: "Sell to customers in 20+ countries",
      descriptionAr: "البيع للعملاء في 20+ دولة",
      icon: "🌍",
      earned: false,
      progress: 85,
    },
    {
      id: "million_club",
      title: "Million Dollar Club",
      titleAr: "نادي المليون دولار",
      description: "Reach $1,000,000 in total sales",
      descriptionAr: "الوصول إلى 1,000,000 دولار في إجمالي المبيعات",
      icon: "💰",
      earned: false,
      progress: 28,
    },
    {
      id: "innovation_leader",
      title: "Innovation Leader",
      titleAr: "قائد الابتكار",
      description: "Launch 5 new product categories",
      descriptionAr: "إطلاق 5 فئات منتجات جديدة",
      icon: "🚀",
      earned: false,
      progress: 60,
    },
  ],
}

export default function MembershipPage() {
  const [membershipData, setMembershipData] = useState<MembershipData>({
    currentPlan: {
      name: "",
      nameAr: "",
      level: "",
      badge: "",
      color: "",
      features: [],
      featuresAr: [],
      validUntil: "",
      progress: 0,
    },
    plans: [],
    benefits: {
      totalSales: 0,
      totalOrders: 0,
      responseRate: 0,
      customerSatisfaction: 0,
    },
    achievements: [],
  })
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState<"en" | "ar">("en")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as "en" | "ar"
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  useEffect(() => {
    fetchMembershipData()
  }, [])

  const fetchMembershipData = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get("/v1/supplier/membership")

      if (response.data && response.data.currentPlan && response.data.plans && Array.isArray(response.data.plans)) {
        setMembershipData(response.data)
      } else {
        setMembershipData(mockMembershipData)
      }
    } catch (error) {
      console.error("Error fetching membership data:", error)
      setMembershipData(mockMembershipData)
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل في تحميل بيانات العضوية" : "Failed to load membership data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const isArabic = language === "ar"

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!membershipData || !Array.isArray(membershipData.plans) || membershipData.plans.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">
          {isArabic ? "فشل في تحميل بيانات العضوية" : "Failed to load membership data"}
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{isArabic ? "العضوية" : "Membership"}</h1>
          <p className="text-muted-foreground">
            {isArabic
              ? "إدارة خطة العضوية والاستفادة من المزايا المتقدمة"
              : "Manage your membership plan and unlock advanced benefits"}
          </p>
        </div>
      </div>

      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span>
                    {isArabic
                      ? membershipData.currentPlan?.nameAr || membershipData.currentPlan?.name || "Gold Supplier"
                      : membershipData.currentPlan?.name || "Gold Supplier"}
                  </span>
                  <Badge variant="secondary" className={membershipData.currentPlan?.color || "text-yellow-600"}>
                    {membershipData.currentPlan?.badge || "🥇"}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {isArabic
                    ? `صالح حتى ${membershipData.currentPlan?.validUntil || "December 31, 2024"}`
                    : `Valid until ${membershipData.currentPlan?.validUntil || "December 31, 2024"}`}
                </CardDescription>
              </div>
            </div>
            <Button>
              {isArabic ? "ترقية الخطة" : "Upgrade Plan"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{isArabic ? "تقدم العضوية" : "Membership Progress"}</span>
                <span>{membershipData.currentPlan?.progress || 75}%</span>
              </div>
              <Progress value={membershipData.currentPlan?.progress || 75} className="h-2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  ${(membershipData.benefits?.totalSales || 284750).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">{isArabic ? "إجمالي المبيعات" : "Total Sales"}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{membershipData.benefits?.totalOrders || 410}</div>
                <div className="text-sm text-muted-foreground">{isArabic ? "إجمالي الطلبات" : "Total Orders"}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{membershipData.benefits?.responseRate || 95}%</div>
                <div className="text-sm text-muted-foreground">{isArabic ? "معدل الاستجابة" : "Response Rate"}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {membershipData.benefits?.customerSatisfaction || 4.8}
                </div>
                <div className="text-sm text-muted-foreground">
                  {isArabic ? "رضا العملاء" : "Customer Satisfaction"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList>
          <TabsTrigger value="plans">{isArabic ? "الخطط" : "Plans"}</TabsTrigger>
          <TabsTrigger value="achievements">{isArabic ? "الإنجازات" : "Achievements"}</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(membershipData.plans || []).map((plan) => (
              <Card key={plan.id} className={`relative ${plan.popular ? "ring-2 ring-primary" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      {isArabic ? "الأكثر شعبية" : "Most Popular"}
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">{plan.badge}</div>
                  <CardTitle className={plan.color}>{isArabic ? plan.nameAr : plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    ${plan.price}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{isArabic ? plan.periodAr : plan.period}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {(isArabic ? plan.featuresAr || [] : plan.features || []).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full"
                    variant={plan.level === membershipData.currentPlan?.level ? "secondary" : "default"}
                    disabled={plan.level === membershipData.currentPlan?.level}
                  >
                    {plan.level === membershipData.currentPlan?.level
                      ? isArabic
                        ? "الخطة الحالية"
                        : "Current Plan"
                      : isArabic
                        ? "اختر هذه الخطة"
                        : "Choose Plan"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(membershipData.achievements || []).map((achievement) => (
              <Card key={achievement.id} className={achievement.earned ? "bg-green-50 border-green-200" : ""}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {isArabic ? achievement.titleAr : achievement.title}
                        {achievement.earned && <CheckCircle className="h-5 w-5 text-green-500" />}
                      </CardTitle>
                      <CardDescription>
                        {isArabic ? achievement.descriptionAr : achievement.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                {!achievement.earned && (
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{isArabic ? "التقدم" : "Progress"}</span>
                        <span>{achievement.progress}%</span>
                      </div>
                      <Progress value={achievement.progress} className="h-2" />
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
