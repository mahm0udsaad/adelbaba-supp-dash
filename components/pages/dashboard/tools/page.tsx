"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calculator,
  Truck,
  DollarSign,
  TrendingUp,
  Search,
  FileText,
  Star,
  ExternalLink,
  Wrench,
  BarChart3,
  Globe,
  Package,
  Users,
  MessageSquare,
  Shield,
} from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { useI18n } from "@/lib/i18n/context"
import { useMockData } from "@/lib/mock-data-context"

interface Tool {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  category: "pricing" | "logistics" | "finance" | "research" | "marketing" | "communication"
  icon: string
  url: string
  popular: boolean
}

const mockTools: Tool[] = [
  {
    id: "price-calculator",
    name: "Price Calculator",
    nameAr: "حاسبة الأسعار",
    description: "Calculate competitive pricing for your products based on market data and costs",
    descriptionAr: "احسب الأسعار التنافسية لمنتجاتك بناءً على بيانات السوق والتكاليف",
    category: "pricing",
    icon: "calculator",
    url: "/tools/price-calculator",
    popular: true,
  },
  {
    id: "shipping-calculator",
    name: "Shipping Cost Calculator",
    nameAr: "حاسبة تكلفة الشحن",
    description: "Estimate shipping costs for different carriers and destinations worldwide",
    descriptionAr: "تقدير تكاليف الشحن لشركات النقل والوجهات المختلفة حول العالم",
    category: "logistics",
    icon: "truck",
    url: "/tools/shipping-calculator",
    popular: true,
  },
  {
    id: "profit-margin-analyzer",
    name: "Profit Margin Analyzer",
    nameAr: "محلل هامش الربح",
    description: "Analyze profit margins and optimize your pricing strategy for maximum profitability",
    descriptionAr: "تحليل هوامش الربح وتحسين استراتيجية التسعير لتحقيق أقصى ربحية",
    category: "finance",
    icon: "trending-up",
    url: "/tools/profit-analyzer",
    popular: true,
  },
  {
    id: "market-research",
    name: "Market Research Tool",
    nameAr: "أداة بحث السوق",
    description: "Research market trends, competitor analysis, and demand forecasting",
    descriptionAr: "بحث اتجاهات السوق وتحليل المنافسين والتنبؤ بالطلب",
    category: "research",
    icon: "search",
    url: "/tools/market-research",
    popular: false,
  },
  {
    id: "invoice-generator",
    name: "Invoice Generator",
    nameAr: "مولد الفواتير",
    description: "Create professional invoices and manage your billing efficiently",
    descriptionAr: "إنشاء فواتير احترافية وإدارة الفوترة بكفاءة",
    category: "finance",
    icon: "file-text",
    url: "/tools/invoice-generator",
    popular: true,
  },
  {
    id: "currency-converter",
    name: "Currency Converter",
    nameAr: "محول العملات",
    description: "Convert currencies with real-time exchange rates for international trade",
    descriptionAr: "تحويل العملات بأسعار الصرف الفورية للتجارة الدولية",
    category: "finance",
    icon: "dollar-sign",
    url: "/tools/currency-converter",
    popular: true,
  },
  {
    id: "roi-calculator",
    name: "ROI Calculator",
    nameAr: "حاسبة عائد الاستثمار",
    description: "Calculate return on investment for your business decisions and marketing campaigns",
    descriptionAr: "احسب عائد الاستثمار لقرارات عملك وحملاتك التسويقية",
    category: "finance",
    icon: "bar-chart-3",
    url: "/tools/roi-calculator",
    popular: false,
  },
  {
    id: "customs-duty-calculator",
    name: "Customs Duty Calculator",
    nameAr: "حاسبة الرسوم الجمركية",
    description: "Calculate import/export duties and taxes for different countries",
    descriptionAr: "احسب رسوم الاستيراد/التصدير والضرائب لبلدان مختلفة",
    category: "logistics",
    icon: "globe",
    url: "/tools/customs-calculator",
    popular: false,
  },
  {
    id: "inventory-optimizer",
    name: "Inventory Optimizer",
    nameAr: "محسن المخزون",
    description: "Optimize inventory levels and reduce carrying costs with smart analytics",
    descriptionAr: "تحسين مستويات المخزون وتقليل تكاليف الحمل بالتحليلات الذكية",
    category: "logistics",
    icon: "package",
    url: "/tools/inventory-optimizer",
    popular: false,
  },
  {
    id: "competitor-tracker",
    name: "Competitor Price Tracker",
    nameAr: "متتبع أسعار المنافسين",
    description: "Monitor competitor prices and stay competitive in the market",
    descriptionAr: "راقب أسعار المنافسين وابق تنافسياً في السوق",
    category: "research",
    icon: "trending-up",
    url: "/tools/competitor-tracker",
    popular: true,
  },
  {
    id: "lead-generator",
    name: "Lead Generator",
    nameAr: "مولد العملاء المحتملين",
    description: "Find and generate qualified leads for your products and services",
    descriptionAr: "ابحث عن العملاء المحتملين المؤهلين لمنتجاتك وخدماتك وولدهم",
    category: "marketing",
    icon: "users",
    url: "/tools/lead-generator",
    popular: true,
  },
  {
    id: "email-templates",
    name: "Email Templates",
    nameAr: "قوالب البريد الإلكتروني",
    description: "Professional email templates for customer communication and marketing",
    descriptionAr: "قوالب بريد إلكتروني احترافية للتواصل مع العملاء والتسويق",
    category: "communication",
    icon: "message-square",
    url: "/tools/email-templates",
    popular: false,
  },
  {
    id: "contract-generator",
    name: "Contract Generator",
    nameAr: "مولد العقود",
    description: "Generate legal contracts and agreements for your business transactions",
    descriptionAr: "إنشاء عقود واتفاقيات قانونية لمعاملاتك التجارية",
    category: "communication",
    icon: "shield",
    url: "/tools/contract-generator",
    popular: false,
  },
  {
    id: "product-catalog",
    name: "Product Catalog Builder",
    nameAr: "منشئ كتالوج المنتجات",
    description: "Create professional product catalogs and brochures for your business",
    descriptionAr: "إنشاء كتالوجات وكتيبات منتجات احترافية لعملك",
    category: "marketing",
    icon: "file-text",
    url: "/tools/catalog-builder",
    popular: false,
  },
  {
    id: "trade-finance",
    name: "Trade Finance Calculator",
    nameAr: "حاسبة تمويل التجارة",
    description: "Calculate financing options and costs for international trade transactions",
    descriptionAr: "احسب خيارات التمويل والتكاليف لمعاملات التجارة الدولية",
    category: "finance",
    icon: "dollar-sign",
    url: "/tools/trade-finance",
    popular: false,
  },
]

const iconMap = {
  calculator: Calculator,
  truck: Truck,
  "dollar-sign": DollarSign,
  "trending-up": TrendingUp,
  search: Search,
  "file-text": FileText,
  "bar-chart-3": BarChart3,
  globe: Globe,
  package: Package,
  users: Users,
  "message-square": MessageSquare,
  shield: Shield,
}

export default function ToolsPage() {
  const { t, isArabic } = useI18n()
  const { tools: allTools } = useMockData()
  const [loading] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [showPopularOnly, setShowPopularOnly] = useState(false)
  const [language] = useState<"en" | "ar">("en")

  const tools = useMemo(() => {
    let filteredTools = [...(allTools as Tool[])]
    if (categoryFilter !== "all") {
      filteredTools = filteredTools.filter((tool) => tool.category === categoryFilter)
    }
    if (showPopularOnly) {
      filteredTools = filteredTools.filter((tool) => tool.popular)
    }
    return filteredTools
  }, [allTools, categoryFilter, showPopularOnly])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "pricing":
        return "bg-blue-100 text-blue-800"
      case "logistics":
        return "bg-green-100 text-green-800"
      case "finance":
        return "bg-yellow-100 text-yellow-800"
      case "research":
        return "bg-purple-100 text-purple-800"
      case "marketing":
        return "bg-pink-100 text-pink-800"
      case "communication":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryName = (category: string) => {
    if (isArabic) {
      switch (category) {
        case "pricing":
          return "التسعير"
        case "logistics":
          return "اللوجستيات"
        case "finance":
          return "المالية"
        case "research":
          return "البحث"
        case "marketing":
          return "التسويق"
        case "communication":
          return "التواصل"
        default:
          return category
      }
    }
    return category.charAt(0).toUpperCase() + category.slice(1)
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.businessTools}</h1>
          <p className="text-muted-foreground">{t.toolsSubtitle}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.allCategories}</SelectItem>
            <SelectItem value="pricing">{t.pricing}</SelectItem>
            <SelectItem value="logistics">{t.logistics}</SelectItem>
            <SelectItem value="finance">{t.finance}</SelectItem>
            <SelectItem value="research">{t.research}</SelectItem>
            <SelectItem value="marketing">{t.marketing}</SelectItem>
            <SelectItem value="communication">{t.communication}</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={showPopularOnly ? "default" : "outline"}
          onClick={() => setShowPopularOnly(!showPopularOnly)}
          className={!showPopularOnly ? "bg-transparent" : ""}
        >
          <Star className="h-4 w-4 mr-2" />
          {t.popularTools}
        </Button>
      </div>

      {/* Tools Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(tools) &&
            tools.map((tool) => {
              const IconComponent = iconMap[tool.icon as keyof typeof iconMap] || Wrench
              return (
                <Card key={tool.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-primary/10 text-primary rounded-lg">
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{isArabic ? tool.nameAr : tool.name}</CardTitle>
                          <Badge className={getCategoryColor(tool.category)} variant="secondary">
                            {getCategoryName(tool.category)}
                          </Badge>
                        </div>
                      </div>
                      {tool.popular && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          {t.popular}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{isArabic ? tool.descriptionAr : tool.description}</p>

                    <div className="flex gap-2">
                      <Link href={tool.url} className="flex-1">
                        <Button className="w-full">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {t.useTool}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

          {Array.isArray(tools) && tools.length === 0 && !loading && (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-12 text-center">
                  <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">{t.noToolsFound}</h3>
                  <p className="text-muted-foreground">
                    {t.tryChangingFilters}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
