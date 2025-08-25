"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users, Download } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"
import { RevenueCharts } from "./components/RevenueCharts"
import { OrdersStatus } from "./components/OrdersStatus"
import { TopLists } from "./components/TopLists"
import { useMockData } from "@/lib/mock-data-context"

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

export default function AnalyticsPage() {
  const [loading] = useState(false)
  const [period, setPeriod] = useState("6months")
  const { t, isArabic } = useI18n()
  const { analytics } = useMockData()
  const analyticsData: AnalyticsData = useMemo(() => {
    const raw = Array.isArray(analytics) ? analytics : []
    return {
      revenue: raw.find((item: any) => item?.id === "revenue")?.data || mockAnalyticsData.revenue,
      orders: raw.find((item: any) => item?.id === "orders")?.data || mockAnalyticsData.orders,
      products: raw.find((item: any) => item?.id === "products")?.data || mockAnalyticsData.products,
      buyers: raw.find((item: any) => item?.id === "buyers")?.data || mockAnalyticsData.buyers,
    }
  }, [analytics, isArabic, period])

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
    revenue: { label: t.revenue, color: "#f59e0b" },
    orders: { label: t.orders, color: "#10b981" },
    count: { label: t.count, color: "#3b82f6" },
    status: { label: t.status, color: "#8b5cf6" },
    percentage: { label: t.percentage, color: "#ef4444" },
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.analyticsHeader}</h1>
          <p className="text-muted-foreground">
            {t.trackPerformance}
          </p>
        </div>

        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">{t.month1}</SelectItem>
              <SelectItem value="3months">{t.months3}</SelectItem>
              <SelectItem value="6months">{t.months6}</SelectItem>
              <SelectItem value="1year">{t.year1}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            {t.export}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalRevenue}</CardTitle>
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
              {Math.abs(analyticsData.revenue?.revenueGrowth || 0)}% {t.fromLastMonth}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalOrdersHeader}</CardTitle>
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
              {Math.abs(analyticsData.orders?.orderGrowth || 0)}% {t.fromLastMonth}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.activeProducts}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.products?.activeProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t.outOf} {analyticsData.products?.totalProducts || 0} {t.productsLower}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.activeBuyers}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.buyers?.activeBuyers || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              {analyticsData.buyers?.newBuyers || 0} {t.newThisMonth}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">{t.revenue}</TabsTrigger>
          <TabsTrigger value="orders">{t.orders}</TabsTrigger>
          <TabsTrigger value="products">{t.products}</TabsTrigger>
          <TabsTrigger value="buyers">{t.buyers}</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <RevenueCharts data={analyticsData} />
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <OrdersStatus data={analyticsData} />
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <TopLists data={analyticsData} variant="products" />
        </TabsContent>

        <TabsContent value="buyers" className="space-y-6">
          <TopLists data={analyticsData} variant="buyers" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
