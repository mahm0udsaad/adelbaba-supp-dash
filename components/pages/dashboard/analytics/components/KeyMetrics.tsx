import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, TrendingDown } from "lucide-react"
import type { AnalyticsData } from "./types"
import { useI18n } from "@/lib/i18n/context"

interface KeyMetricsProps {
  data: AnalyticsData
}

export function KeyMetrics({ data }: KeyMetricsProps) {
  const { t } = useI18n()
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t.totalRevenue}</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${(data.revenue?.totalRevenue || 0).toLocaleString()}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            {(data.revenue?.revenueGrowth || 0) > 0 ? (
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
            )}
            {Math.abs(data.revenue?.revenueGrowth || 0)}% {t.fromLastMonth}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t.totalOrdersHeader}</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{(data.orders?.totalOrders || 0).toLocaleString()}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            {(data.orders?.orderGrowth || 0) > 0 ? (
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
            )}
            {Math.abs(data.orders?.orderGrowth || 0)}% {t.fromLastMonth}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t.activeProducts}</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.products?.activeProducts || 0}</div>
          <p className="text-xs text-muted-foreground">
            {t.outOf} {data.products?.totalProducts || 0} {t.productsLower}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t.activeBuyers}</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.buyers?.activeBuyers || 0}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            {data.buyers?.newBuyers || 0} {t.newThisMonth}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


