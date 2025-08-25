export interface RevenueMonthlyDatum {
  month: string
  revenue: number
  orders: number
}

export interface OrdersStatusDatum {
  status: string
  count: number
  percentage: number
}

export interface TopProductDatum {
  id: string
  name: string
  sales: number
  revenue: number
}

export interface TopBuyerDatum {
  id: string
  name: string
  orders: number
  revenue: number
  country: string
}

export interface AnalyticsData {
  revenue: {
    totalRevenue: number
    monthlyRevenue: number
    revenueGrowth: number
    monthlyData: RevenueMonthlyDatum[]
  }
  orders: {
    totalOrders: number
    monthlyOrders: number
    orderGrowth: number
    statusBreakdown: OrdersStatusDatum[]
  }
  products: {
    totalProducts: number
    activeProducts: number
    topProducts: TopProductDatum[]
  }
  buyers: {
    totalBuyers: number
    activeBuyers: number
    newBuyers: number
    buyerGrowth: number
    topBuyers: TopBuyerDatum[]
  }
}

