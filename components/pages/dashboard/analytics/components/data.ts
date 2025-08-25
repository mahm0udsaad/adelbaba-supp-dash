import type { AnalyticsData } from "./types"

export const mockAnalyticsData: AnalyticsData = {
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

