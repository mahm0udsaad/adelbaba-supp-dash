"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users, Download } from "lucide-react"
import apiClient from "@/lib/axios"
import { toast } from "@/hooks/use-toast"

interface AnalyticsData {
  revenue: {
    totalRevenue: number
    monthlyRevenue: number
    revenueGrowth: number
    monthlyData: Array<{ month: string; revenue: number; orders: number }>
  }
  orders: {
    totalOrders: number
    monthlyOrders: number
    orderGrowth: number
    statusBreakdown: Array<{ status: string; count: number; percentage: number }>
  }
  products: {
    totalProducts: number
    activeProducts: number
    topProducts: Array<{ id: string; name: string; sales: number; revenue: number }>
  }
  buyers: {
    totalBuyers: number
    activeBuyers: number
    newBuyers: number
    buyerGrowth: number
    topBuyers: Array<{ id: string; name: string; orders: number; revenue: number; country: string }>
  }
}

const mockAnalyticsData: AnalyticsData = {
  revenue: {
    totalRevenue: 284750,
    monthlyRevenue: 47458,
    revenueGrowth: 18.5,
    monthlyData: [
      { month: "Jul", revenue: 32500, orders: 45 },
      { month: "Aug", revenue: 38200, orders: 52 },
      { month: "Sep", revenue: 41800, orders: 58 },
      { month: "Oct", revenue: 45300, orders: 61 },
      { month: "Nov", revenue: 39900, orders: 55 },
      { month: "Dec", revenue: 47458, orders: 67 },
      { month: "Jan", revenue: 52100, orders: 72 },
    ],
  },
  orders: {
    totalOrders: 410,
    monthlyOrders: 67,
    orderGrowth: 21.8,
    statusBreakdown: [
      { status: "Delivered", count: 245, percentage: 59.8 },
      { status: "Shipped", count: 78, percentage: 19.0 },
      { status: "In Escrow", count: 52, percentage: 12.7 },
      { status: "Awaiting Payment", count: 25, percentage: 6.1 },
      { status: "Disputed", count: 10, percentage: 2.4 },
    ],
  },
  products: {
    totalProducts: 156,
    activeProducts: 142,
    topProducts: [
      { id: "LED-001", name: "Industrial LED Light Fixtures", sales: 89, revenue: 45200 },
      { id: "TEX-001", name: "Premium Cotton T-Shirts", sales: 156, revenue: 38400 },
      { id: "AUD-001", name: "Bluetooth Wireless Speakers", sales: 78, revenue: 32100 },
      { id: "ELE-001", name: "Wireless Headphones Premium", sales: 92, revenue: 28750 },
      { id: "CAB-001", name: "USB-C Charging Cables", sales: 234, revenue: 24680 },
      { id: "MOB-001", name: "Smartphone Cases Premium", sales: 145, revenue: 22300 },
      { id: "GAR-001", name: "Solar Garden Lights", sales: 67, revenue: 18900 },
      { id: "OFF-001", name: "Ergonomic Office Chairs", sales: 34, revenue: 15200 },
    ],
  },
  buyers: {
    totalBuyers: 89,
    activeBuyers: 67,
    newBuyers: 12,
    buyerGrowth: 15.2,
    topBuyers: [
      { id: "BUY-001", name: "TechCorp Industries", orders: 23, revenue: 67500, country: "United States" },
      { id: "BUY-002", name: "Fashion Forward LLC", orders: 18, revenue: 45200, country: "United Kingdom" },
      { id: "BUY-003", name: "Global Retail Co", orders: 15, revenue: 38900, country: "Canada" },
      { id: "BUY-004", name: "Audio Solutions Inc", orders: 12, revenue: 32400, country: "Australia" },
      { id: "BUY-005", name: "Electronics Hub", orders: 14, revenue: 28750, country: "Germany" },
      { id: "BUY-006", name: "StartupTech Ltd", orders: 9, revenue: 24100, country: "Netherlands" },
      { id: "BUY-007", name: "Home & Garden Co", orders: 11, revenue: 19800, country: "France" },
      { id: "BUY-008", name: "Office Solutions Pro", orders: 8, revenue: 16500, country: "Sweden" },
    ],
  },
}

const COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6"]

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    revenue: {
      totalRevenue: 0,
      monthlyRevenue: 0,
      revenueGrowth: 0,
      monthlyData: [],
    },
    orders: {
      totalOrders: 0,
      monthlyOrders: 0,
      orderGrowth: 0,
      statusBreakdown: [],
    },
    products: {
      totalProducts: 0,
      activeProducts: 0,
      topProducts: [],
    },
    buyers: {
      totalBuyers: 0,
      activeBuyers: 0,
      newBuyers: 0,
      buyerGrowth: 0,
      topBuyers: [],
    },
  })
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("6months")
  const [language] = useState<"en" | "ar">("en")

  const isArabic = language === "ar"

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get(`/api/v1/supplier/analytics?period=${period}`)

        const rawData = response.data?.data || []

        // If API returns valid data, transform it
        if (Array.isArray(rawData) && rawData.length > 0) {
          const transformedData: AnalyticsData = {
            revenue: rawData.find((item: any) => item?.id === "revenue")?.data || mockAnalyticsData.revenue,
            orders: rawData.find((item: any) => item?.id === "orders")?.data || mockAnalyticsData.orders,
            products: rawData.find((item: any) => item?.id === "products")?.data || mockAnalyticsData.products,
            buyers: rawData.find((item: any) => item?.id === "buyers")?.data || mockAnalyticsData.buyers,
          }
          setAnalyticsData(transformedData)
        } else {
          setAnalyticsData(mockAnalyticsData)
        }
      } catch (error) {
        console.error("Error fetching analytics:", error)
        setAnalyticsData(mockAnalyticsData)
        toast({
          title: isArabic ? "خطأ" : "Error",
          description: isArabic ? "فشل في تحميل البيانات التحليلية" : "Failed to load analytics data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [period, isArabic])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-80 bg-muted animate-pulse rounded" />
          <div className="h-80 bg-muted animate-pulse rounded" />
        </div>
      </div>
    )
  }

  const chartConfig = {
    revenue: {
      label: isArabic ? "الإيرادات" : "Revenue",
      color: "#f59e0b",
    },
    orders: {
      label: isArabic ? "الطلبات" : "Orders",
      color: "#10b981",
    },
    count: {
      label: isArabic ? "العدد" : "Count",
      color: "#3b82f6",
    },
    status: {
      label: isArabic ? "الحالة" : "Status",
      color: "#8b5cf6",
    },
    percentage: {
      label: isArabic ? "النسبة المئوية" : "Percentage",
      color: "#ef4444",
    },
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{isArabic ? "التحليلات" : "Analytics"}</h1>
          <p className="text-muted-foreground">
            {isArabic ? "تتبع أداء أعمالك وإحصائياتك" : "Track your business performance and insights"}
          </p>
        </div>

        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">{isArabic ? "شهر واحد" : "1 Month"}</SelectItem>
              <SelectItem value="3months">{isArabic ? "3 أشهر" : "3 Months"}</SelectItem>
              <SelectItem value="6months">{isArabic ? "6 أشهر" : "6 Months"}</SelectItem>
              <SelectItem value="1year">{isArabic ? "سنة واحدة" : "1 Year"}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            {isArabic ? "تصدير" : "Export"}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isArabic ? "إجمالي الإيرادات" : "Total Revenue"}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(analyticsData.revenue?.totalRevenue || 0).toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {(analyticsData.revenue?.revenueGrowth || 0) > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {Math.abs(analyticsData.revenue?.revenueGrowth || 0)}% {isArabic ? "من الشهر الماضي" : "from last month"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isArabic ? "إجمالي الطلبات" : "Total Orders"}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(analyticsData.orders?.totalOrders || 0).toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {(analyticsData.orders?.orderGrowth || 0) > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {Math.abs(analyticsData.orders?.orderGrowth || 0)}% {isArabic ? "من الشهر الماضي" : "from last month"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isArabic ? "المنتجات النشطة" : "Active Products"}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.products?.activeProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? "من أصل" : "out of"} {analyticsData.products?.totalProducts || 0}{" "}
              {isArabic ? "منتج" : "products"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isArabic ? "المشترون النشطون" : "Active Buyers"}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.buyers?.activeBuyers || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              {analyticsData.buyers?.newBuyers || 0} {isArabic ? "جديد هذا الشهر" : "new this month"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">{isArabic ? "الإيرادات" : "Revenue"}</TabsTrigger>
          <TabsTrigger value="orders">{isArabic ? "الطلبات" : "Orders"}</TabsTrigger>
          <TabsTrigger value="products">{isArabic ? "المنتجات" : "Products"}</TabsTrigger>
          <TabsTrigger value="buyers">{isArabic ? "المشترون" : "Buyers"}</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "اتجاه الإيرادات" : "Revenue Trend"}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                    <LineChart
                      data={analyticsData.revenue?.monthlyData || []}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke={chartConfig.revenue.color}
                        strokeWidth={2}
                        dot={{ fill: chartConfig.revenue.color }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "الإيرادات مقابل الطلبات" : "Revenue vs Orders"}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                    <BarChart
                      data={analyticsData.revenue?.monthlyData || []}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar yAxisId="left" dataKey="revenue" fill={chartConfig.revenue.color} />
                      <Bar yAxisId="right" dataKey="orders" fill={chartConfig.orders.color} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "حالة الطلبات" : "Order Status"}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                    <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <Pie
                        data={analyticsData.orders?.statusBreakdown || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => {
                          const status = entry?.status || entry?.payload?.status || ""
                          const percentage = entry?.percentage || entry?.payload?.percentage || 0
                          return status ? `${status} (${percentage.toFixed(1)}%)` : ""
                        }}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {(analyticsData.orders?.statusBreakdown || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-background border rounded-lg p-2 shadow-lg">
                                <p className="font-medium">{data.status}</p>
                                <p className="text-sm text-muted-foreground">
                                  {data.count} orders ({data.percentage?.toFixed(1)}%)
                                </p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "تفاصيل حالة الطلبات" : "Order Status Details"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(analyticsData.orders?.statusBreakdown || []).map((status, index) => (
                    <div key={status.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{status.status}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{status.count}</div>
                        <div className="text-sm text-muted-foreground">{(status.percentage || 0).toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "أفضل المنتجات أداءً" : "Top Performing Products"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(analyticsData.products?.topProducts || []).map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {product.sales} {isArabic ? "مبيعات" : "sales"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">${(product.revenue || 0).toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">{isArabic ? "إيرادات" : "revenue"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buyers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "أفضل المشترين" : "Top Buyers"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(analyticsData.buyers?.topBuyers || []).map((buyer, index) => (
                  <div key={buyer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{buyer.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {buyer.orders} {isArabic ? "طلبات" : "orders"} • {buyer.country}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">${(buyer.revenue || 0).toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">{isArabic ? "إيرادات" : "revenue"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
