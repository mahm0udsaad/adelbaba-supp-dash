"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  ShoppingCart,
  Package,
  TrendingUp,
  DollarSign,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import apiClient from "@/lib/axios"

interface DashboardStats {
  newRfqs: number
  activeOrders: number
  totalProducts: number
  monthlyRevenue: number
}

interface RecentRFQ {
  id: string
  title: string
  buyerCompany: string
  category: string
  targetPrice: number
  currency: string
  expiresAt: string
  status: string
}

interface RecentOrder {
  id: string
  buyerCompany: string
  items: Array<{
    productName: string
    qty: number
  }>
  total: number
  status: string
  createdAt: string
}

export default function DashboardPage() {
  const [language] = useState<"en" | "ar">("en")
  const [stats, setStats] = useState<DashboardStats>({
    newRfqs: 0,
    activeOrders: 0,
    totalProducts: 0,
    monthlyRevenue: 0,
  })
  const [recentRFQs, setRecentRFQs] = useState<RecentRFQ[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  const isArabic = language === "ar"

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const [rfqsRes, ordersRes, productsRes, analyticsRes] = await Promise.all([
        apiClient.get("/api/v1/supplier/rfqs?limit=3"),
        apiClient.get("/api/v1/supplier/orders?limit=2"),
        apiClient.get("/api/v1/supplier/products"),
        apiClient.get("/api/v1/supplier/analytics"),
      ])

      // Extract stats from API responses
      const rfqsData = rfqsRes.data.data || []
      const ordersData = ordersRes.data.data || []
      const productsData = productsRes.data.data || []
      const analyticsData = analyticsRes.data || {}

      setStats({
        newRfqs: rfqsData.filter((rfq: any) => rfq.status === "open").length,
        activeOrders: ordersData.filter((order: any) => ["in_escrow", "shipped"].includes(order.status)).length,
        totalProducts: productsData.length,
        monthlyRevenue: analyticsData.revenue?.current || 0,
      })

      setRecentRFQs(rfqsData.slice(0, 3))
      setRecentOrders(ordersData.slice(0, 2))
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
      // Fallback to empty data on error
      setStats({ newRfqs: 0, activeOrders: 0, totalProducts: 0, monthlyRevenue: 0 })
      setRecentRFQs([])
      setRecentOrders([])
    } finally {
      setLoading(false)
    }
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

  const getOrderItemsText = (items: any[]) => {
    if (items.length === 1) {
      return `${items[0].productName} x ${items[0].qty}`
    }
    return `${items[0].productName} x ${items[0].qty} +${items.length - 1} more`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-96 bg-muted animate-pulse rounded" />
          <div className="h-96 bg-muted animate-pulse rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{isArabic ? "لوحة التحكم" : "Dashboard"}</h1>
        <p className="text-muted-foreground">
          {isArabic ? "نظرة عامة على أنشطة الموردين والأداء" : "Overview of your supplier activities and performance"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isArabic ? "طلبات الأسعار الجديدة" : "New RFQs"}</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newRfqs}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isArabic ? "الطلبات النشطة" : "Active Orders"}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isArabic ? "المنتجات" : "Products"}</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isArabic ? "الإيرادات الشهرية" : "Monthly Revenue"}</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+18%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent RFQs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {isArabic ? "طلبات الأسعار الحديثة" : "Recent RFQs"}
            </CardTitle>
            <CardDescription>
              {isArabic ? "طلبات الأسعار التي تحتاج إلى اهتمامك" : "RFQs that need your attention"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentRFQs.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                {isArabic ? "لا توجد طلبات أسعار حديثة" : "No recent RFQs"}
              </div>
            ) : (
              recentRFQs.map((rfq) => (
                <div key={rfq.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">{rfq.title}</h4>
                    <p className="text-xs text-muted-foreground">{rfq.buyerCompany}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline">{rfq.category}</Badge>
                      <span className="text-primary font-medium">
                        ${rfq.targetPrice}/{isArabic ? "قطعة" : "unit"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={rfq.status === "open" ? "default" : "secondary"}>
                      {rfq.status === "open" ? (isArabic ? "مفتوح" : "Open") : isArabic ? "تم الرد" : "Quoted"}
                    </Badge>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getTimeRemaining(rfq.expiresAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <Link href="/dashboard/rfq">
              <Button variant="outline" className="w-full bg-transparent">
                <Eye className="h-4 w-4 mr-2" />
                {isArabic ? "عرض جميع طلبات الأسعار" : "View All RFQs"}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {isArabic ? "الطلبات الحديثة" : "Recent Orders"}
            </CardTitle>
            <CardDescription>{isArabic ? "آخر الطلبات وحالتها" : "Latest orders and their status"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentOrders.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                {isArabic ? "لا توجد طلبات حديثة" : "No recent orders"}
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">{order.buyerCompany}</h4>
                    <p className="text-xs text-muted-foreground">{getOrderItemsText(order.items)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-medium text-primary">${order.total.toLocaleString()}</p>
                    <Badge variant={order.status === "shipped" ? "default" : "secondary"}>
                      {order.status === "shipped" ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {isArabic ? "تم الشحن" : "Shipped"}
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          {isArabic ? "في الضمان" : "In Escrow"}
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              ))
            )}
            <Link href="/dashboard/orders">
              <Button variant="outline" className="w-full bg-transparent">
                <Eye className="h-4 w-4 mr-2" />
                {isArabic ? "عرض جميع الطلبات" : "View All Orders"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? "الإجراءات السريعة" : "Quick Actions"}</CardTitle>
          <CardDescription>{isArabic ? "الإجراءات الأكثر استخداماً" : "Most commonly used actions"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/dashboard/products/new">
              <Button className="h-20 flex-col gap-2 w-full">
                <Package className="h-6 w-6" />
                {isArabic ? "إضافة منتج جديد" : "Add New Product"}
              </Button>
            </Link>
            <Link href="/dashboard/inbox">
              <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent w-full">
                <MessageSquare className="h-6 w-6" />
                {isArabic ? "الرسائل الجديدة" : "Check Messages"}
              </Button>
            </Link>
            <Link href="/dashboard/analytics">
              <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent w-full">
                <TrendingUp className="h-6 w-6" />
                {isArabic ? "عرض التحليلات" : "View Analytics"}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
