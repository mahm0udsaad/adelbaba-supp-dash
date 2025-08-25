import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart } from "lucide-react"
import type { Order } from "./types"
import { OrderCard } from "./OrderCard"

interface OrdersListProps {
  loading: boolean
  orders: Order[]
  labels: {
    noOrdersFound: string
    tryAdjustingSearch: string
    item: string
    items: string
    viewDetails: string
    orderDate: string
    pending: string
    held: string
    released: string
    disputed: string
    refunded: string
  }
}

export function OrdersList({ loading, orders, labels }: OrdersListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">{labels.noOrdersFound}</h3>
          <p className="text-sm text-muted-foreground">{labels.tryAdjustingSearch}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} labels={labels} />
      ))}
    </div>
  )
}


