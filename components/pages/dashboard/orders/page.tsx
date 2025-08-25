"use client"

import { useMemo, useState } from "react"
import { useI18n } from "@/lib/i18n/context"
import { OrdersHeader } from "./components/OrdersHeader"
import { FiltersBar } from "./components/FiltersBar"
import { OrdersList } from "./components/OrdersList"
import type { Order, OrdersFiltersState } from "./components/types"
import { DollarSign, Package, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMockData } from "@/lib/mock-data-context"

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

export default function OrdersPage() {
  const [filters, setFilters] = useState<OrdersFiltersState>({ search: "", status: "all" })
  const { t, isArabic } = useI18n()
  const { orders: allOrders } = useMockData()
  const loading = false
  const fetchOrders = async () => {}

  const filteredOrders = useMemo(() => (allOrders as Order[]).filter((order) => {
    const matchesSearch =
      filters.search === "" ||
      order.id.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.buyerCompany.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.items.some((item) => item.productName.toLowerCase().includes(filters.search.toLowerCase()))

    const matchesStatus = filters.status === "all" || order.status === filters.status

    return matchesSearch && matchesStatus
  }), [allOrders, filters])

  return (
    <div className="p-4 space-y-6">
      <OrdersHeader title={t.orders} subtitle={t.manageOrders} />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalOrders}</CardTitle>
            {/* icon moved to simplified header */}
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

      <FiltersBar
        filters={filters}
        setFilters={setFilters}
        searchPlaceholder={t.searchOrders}
        labels={{
          search: t.search,
          filter: t.filter,
          allStatus: t.allStatus,
          awaitingPayment: t.awaitingPayment,
          inEscrow: t.inEscrow,
          shipped: t.shipped,
          delivered: t.delivered,
          disputed: t.disputed,
          refresh: t.refresh,
        }}
        onRefresh={fetchOrders}
      />

      <OrdersList
        loading={loading}
        orders={filteredOrders}
        labels={{
          noOrdersFound: t.noOrdersFound,
          tryAdjustingSearch: t.tryAdjustingSearch,
          item: t.item,
          items: t.items,
          viewDetails: t.viewDetails,
          orderDate: t.orderDate,
          pending: t.pending,
          held: t.held,
          released: t.released,
          disputed: t.disputed,
          refunded: t.refunded,
        }}
      />
    </div>
  )
}
