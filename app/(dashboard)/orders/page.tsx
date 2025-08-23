"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  DollarSign,
  Package,
  Truck,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building,
} from "lucide-react"
import Link from "next/link"
import apiClient from "@/lib/axios"
import { useI18n } from "@/lib/i18n/context"

interface Order {
  id: string
  buyerCompany: string
  items: Array<{
    productId: string
    productName: string
    sku: string
    qty: number
    unitPrice: number
    totalPrice: number
  }>
  currency: string
  total: number
  tradeAssurance: {
    enabled: boolean
    escrowStatus: string | null
    escrowAmount: number
  }
  shipping: {
    carrier: string | null
    tracking: string | null
    method: string | null
  }
  status: string
  priority: string
  paymentStatus: string
  createdAt: string
  updatedAt: string
}

const mockOrders: Order[] = [
  {
    id: "ORD-2024-001",
    buyerCompany: "TechCorp Industries",
    items: [
      {
        productId: "LED-001",
        productName: "Industrial LED Light Fixtures",
        sku: "LED-IND-500W",
        qty: 500,
        unitPrice: 45.0,
        totalPrice: 22500.0,
      },
      {
        productId: "LED-002",
        productName: "LED Control Panels",
        sku: "LED-CTRL-24V",
        qty: 50,
        unitPrice: 120.0,
        totalPrice: 6000.0,
      },
    ],
    currency: "USD",
    total: 28500.0,
    tradeAssurance: {
      enabled: true,
      escrowStatus: "held",
      escrowAmount: 28500.0,
    },
    shipping: {
      carrier: "DHL Express",
      tracking: "DHL123456789",
      method: "Air Express",
    },
    status: "shipped",
    priority: "high",
    paymentStatus: "paid",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-18T14:20:00Z",
  },
  {
    id: "ORD-2024-002",
    buyerCompany: "Fashion Forward LLC",
    items: [
      {
        productId: "TEX-001",
        productName: "Premium Cotton T-Shirts",
        sku: "TEX-COTTON-M",
        qty: 1000,
        unitPrice: 8.5,
        totalPrice: 8500.0,
      },
    ],
    currency: "USD",
    total: 8500.0,
    tradeAssurance: {
      enabled: true,
      escrowStatus: "pending",
      escrowAmount: 8500.0,
    },
    shipping: {
      carrier: null,
      tracking: null,
      method: "Sea Freight",
    },
    status: "in_escrow",
    priority: "medium",
    paymentStatus: "pending",
    createdAt: "2024-01-20T09:15:00Z",
    updatedAt: "2024-01-20T09:15:00Z",
  },
  {
    id: "ORD-2024-003",
    buyerCompany: "Audio Solutions Inc",
    items: [
      {
        productId: "AUD-001",
        productName: "Bluetooth Wireless Speakers",
        sku: "AUD-BT-50W",
        qty: 200,
        unitPrice: 25.0,
        totalPrice: 5000.0,
      },
      {
        productId: "AUD-002",
        productName: "Speaker Accessories Kit",
        sku: "AUD-ACC-KIT",
        qty: 200,
        unitPrice: 5.0,
        totalPrice: 1000.0,
      },
    ],
    currency: "USD",
    total: 6000.0,
    tradeAssurance: {
      enabled: false,
      escrowStatus: null,
      escrowAmount: 0,
    },
    shipping: {
      carrier: "FedEx",
      tracking: "FDX987654321",
      method: "Ground",
    },
    status: "delivered",
    priority: "low",
    paymentStatus: "paid",
    createdAt: "2024-01-10T16:45:00Z",
    updatedAt: "2024-01-25T11:30:00Z",
  },
  {
    id: "ORD-2024-004",
    buyerCompany: "Global Retail Co",
    items: [
      {
        productId: "ELE-001",
        productName: "Wireless Headphones Premium",
        sku: "ELE-WH-PRO",
        qty: 150,
        unitPrice: 30.0,
        totalPrice: 4500.0,
      },
    ],
    currency: "USD",
    total: 4500.0,
    tradeAssurance: {
      enabled: true,
      escrowStatus: "released",
      escrowAmount: 4500.0,
    },
    shipping: {
      carrier: "UPS",
      tracking: "UPS456789123",
      method: "Express",
    },
    status: "delivered",
    priority: "high",
    paymentStatus: "paid",
    createdAt: "2024-01-05T14:20:00Z",
    updatedAt: "2024-01-22T16:45:00Z",
  },
  {
    id: "ORD-2024-005",
    buyerCompany: "StartupTech Ltd",
    items: [
      {
        productId: "CAB-001",
        productName: "USB-C Charging Cables",
        sku: "CAB-USBC-2M",
        qty: 500,
        unitPrice: 2.5,
        totalPrice: 1250.0,
      },
    ],
    currency: "USD",
    total: 1250.0,
    tradeAssurance: {
      enabled: true,
      escrowStatus: "disputed",
      escrowAmount: 1250.0,
    },
    shipping: {
      carrier: "DHL",
      tracking: "DHL789123456",
      method: "Standard",
    },
    status: "disputed",
    priority: "high",
    paymentStatus: "held",
    createdAt: "2024-01-12T11:00:00Z",
    updatedAt: "2024-01-28T09:30:00Z",
  },
  {
    id: "ORD-2024-006",
    buyerCompany: "Electronics Hub",
    items: [
      {
        productId: "MOB-001",
        productName: "Smartphone Cases Premium",
        sku: "MOB-CASE-PREM",
        qty: 300,
        unitPrice: 12.0,
        totalPrice: 3600.0,
      },
      {
        productId: "MOB-002",
        productName: "Screen Protectors Tempered Glass",
        sku: "MOB-SCREEN-TG",
        qty: 300,
        unitPrice: 3.0,
        totalPrice: 900.0,
      },
    ],
    currency: "USD",
    total: 4500.0,
    tradeAssurance: {
      enabled: true,
      escrowStatus: "held",
      escrowAmount: 4500.0,
    },
    shipping: {
      carrier: null,
      tracking: null,
      method: "Air Freight",
    },
    status: "awaiting_payment",
    priority: "medium",
    paymentStatus: "pending",
    createdAt: "2024-01-25T13:15:00Z",
    updatedAt: "2024-01-25T13:15:00Z",
  },
  {
    id: "ORD-2024-007",
    buyerCompany: "Home & Garden Co",
    items: [
      {
        productId: "GAR-001",
        productName: "Solar Garden Lights",
        sku: "GAR-SOLAR-LED",
        qty: 100,
        unitPrice: 15.0,
        totalPrice: 1500.0,
      },
    ],
    currency: "USD",
    total: 1500.0,
    tradeAssurance: {
      enabled: false,
      escrowStatus: null,
      escrowAmount: 0,
    },
    shipping: {
      carrier: "China Post",
      tracking: "CP123456789CN",
      method: "Economy",
    },
    status: "shipped",
    priority: "low",
    paymentStatus: "paid",
    createdAt: "2024-01-18T08:30:00Z",
    updatedAt: "2024-01-26T10:15:00Z",
  },
  {
    id: "ORD-2024-008",
    buyerCompany: "Office Solutions Pro",
    items: [
      {
        productId: "OFF-001",
        productName: "Ergonomic Office Chairs",
        sku: "OFF-CHAIR-ERG",
        qty: 25,
        unitPrice: 85.0,
        totalPrice: 2125.0,
      },
      {
        productId: "OFF-002",
        productName: "Adjustable Standing Desks",
        sku: "OFF-DESK-ADJ",
        qty: 15,
        unitPrice: 150.0,
        totalPrice: 2250.0,
      },
    ],
    currency: "USD",
    total: 4375.0,
    tradeAssurance: {
      enabled: true,
      escrowStatus: "held",
      escrowAmount: 4375.0,
    },
    shipping: {
      carrier: "TNT",
      tracking: "TNT987654321",
      method: "Express",
    },
    status: "in_escrow",
    priority: "high",
    paymentStatus: "paid",
    createdAt: "2024-01-22T15:45:00Z",
    updatedAt: "2024-01-23T09:20:00Z",
  },
  {
    id: "ORD-2024-009",
    buyerCompany: "Medical Supplies Inc",
    items: [
      {
        productId: "MED-001",
        productName: "Digital Thermometers",
        sku: "MED-THERM-DIG",
        qty: 200,
        unitPrice: 18.0,
        totalPrice: 3600.0,
      },
      {
        productId: "MED-002",
        productName: "Disposable Face Masks",
        sku: "MED-MASK-N95",
        qty: 1000,
        unitPrice: 1.5,
        totalPrice: 1500.0,
      },
    ],
    currency: "USD",
    total: 5100.0,
    tradeAssurance: {
      enabled: true,
      escrowStatus: "held",
      escrowAmount: 5100.0,
    },
    shipping: {
      carrier: "DHL Express",
      tracking: "DHL555666777",
      method: "Air Express",
    },
    status: "shipped",
    priority: "high",
    paymentStatus: "paid",
    createdAt: "2024-01-28T11:20:00Z",
    updatedAt: "2024-01-30T16:45:00Z",
  },
  {
    id: "ORD-2024-010",
    buyerCompany: "Automotive Parts Ltd",
    items: [
      {
        productId: "AUTO-001",
        productName: "LED Headlight Bulbs",
        sku: "AUTO-LED-H7",
        qty: 100,
        unitPrice: 22.0,
        totalPrice: 2200.0,
      },
    ],
    currency: "USD",
    total: 2200.0,
    tradeAssurance: {
      enabled: false,
      escrowStatus: null,
      escrowAmount: 0,
    },
    shipping: {
      carrier: "FedEx",
      tracking: "FDX111222333",
      method: "Ground",
    },
    status: "delivered",
    priority: "medium",
    paymentStatus: "paid",
    createdAt: "2024-01-08T14:30:00Z",
    updatedAt: "2024-01-20T10:15:00Z",
  },
]

const statusColors = {
  awaiting_payment: "bg-yellow-100 text-yellow-800 border-yellow-200",
  in_escrow: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-gray-100 text-gray-800 border-gray-200",
  disputed: "bg-red-100 text-red-800 border-red-200",
}

const escrowStatusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  held: "bg-blue-100 text-blue-700",
  released: "bg-green-100 text-green-700",
  disputed: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
  })
  const { t, isArabic } = useI18n()

  useEffect(() => {
    fetchOrders()
  }, [filters])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      })

      const response = await apiClient.get(`/api/v1/supplier/orders?${params}`)
      setOrders(response.data?.data || mockOrders)
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      setOrders(mockOrders)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      filters.search === "" ||
      order.id.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.buyerCompany.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.items.some((item) => item.productName.toLowerCase().includes(filters.search.toLowerCase()))

    const matchesStatus = filters.status === "all" || order.status === filters.status

    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "awaiting_payment":
        return <Clock className="h-4 w-4" />
      case "in_escrow":
        return <Shield className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "disputed":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "awaiting_payment":
        return t.awaitingPayment
      case "in_escrow":
        return t.inEscrow
      case "shipped":
        return t.shipped
      case "delivered":
        return t.delivered
      case "cancelled":
        return t.cancelled
      case "disputed":
        return t.disputed
      default:
        return status
    }
  }

  const getEscrowStatusLabel = (status: string | null) => {
    if (!status) return ""
    switch (status) {
      case "pending":
        return t.pending
      case "held":
        return t.held
      case "released":
        return t.released
      case "disputed":
        return t.disputed
      case "refunded":
        return t.refunded
      default:
        return status
    }
  }

  return (
    <div className="p-4 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t.orders}</h1>
        <p className="text-muted-foreground">{t.manageOrders}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalOrders}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredOrders?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.activeOrders}</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(filteredOrders || []).filter((o) => ["in_escrow", "shipped"].includes(o.status)).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.tradeAssurance}</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(filteredOrders || []).filter((o) => o.tradeAssurance.enabled).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalValue}</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(filteredOrders || []).reduce((sum, order) => sum + order.total, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t.search} & {t.filter}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.searchOrders}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>

            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allStatus}</SelectItem>
                <SelectItem value="awaiting_payment">{t.awaitingPayment}</SelectItem>
                <SelectItem value="in_escrow">{t.inEscrow}</SelectItem>
                <SelectItem value="shipped">{t.shipped}</SelectItem>
                <SelectItem value="delivered">{t.delivered}</SelectItem>
                <SelectItem value="disputed">{t.disputed}</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={fetchOrders} variant="outline" className="bg-transparent">
              {t.refresh}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !filteredOrders || filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">{t.noOrdersFound}</h3>
              <p className="text-sm text-muted-foreground">{t.tryAdjustingSearch}</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{order.id}</h3>
                      <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {getStatusLabel(order.status)}
                        </div>
                      </Badge>
                      {order.tradeAssurance.enabled && (
                        <Badge
                          variant="outline"
                          className={
                            escrowStatusColors[order.tradeAssurance.escrowStatus as keyof typeof escrowStatusColors]
                          }
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          {getEscrowStatusLabel(order.tradeAssurance.escrowStatus)}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {order.buyerCompany}
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        {order.items?.length || 0} {(order.items?.length || 0) === 1 ? t.item : t.items}
                      </div>
                      {order.shipping.tracking && (
                        <div className="flex items-center gap-1">
                          <Truck className="h-4 w-4" />
                          {order.shipping.carrier}: {order.shipping.tracking}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {(order.items || []).slice(0, 2).map((item, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">{item.productName}</span>
                          <span className="text-muted-foreground ml-2">
                            {item.qty} × ${item.unitPrice} = ${item.totalPrice}
                          </span>
                        </div>
                      ))}
                      {(order.items?.length || 0) > 2 && (
                        <div className="text-sm text-muted-foreground">
                          +{(order.items?.length || 0) - 2} {t.moreItems}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        {t.orderDate} {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-lg font-bold text-primary">${order.total.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Link href={`/dashboard/orders/${order.id}`}>
                      <Button size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        {t.viewDetails}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
