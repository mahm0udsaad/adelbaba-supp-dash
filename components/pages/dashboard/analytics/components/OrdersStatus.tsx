import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import type { AnalyticsData } from "./types"
import { COLORS } from "./ChartConfig"
import { useI18n } from "@/lib/i18n/context"

interface OrdersStatusProps {
  data: AnalyticsData
}

export function OrdersStatus({ data }: OrdersStatusProps) {
  const { t } = useI18n()
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t.orderStatus}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ChartContainer config={{}} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
              <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <Pie
                  data={data.orders?.statusBreakdown || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => {
                    const status = (entry as any)?.status || (entry as any)?.payload?.status || ""
                    const percentage = (entry as any)?.percentage || (entry as any)?.payload?.percentage || 0
                    return status ? `${status} (${percentage.toFixed(1)}%)` : ""
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(data.orders?.statusBreakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const datum: any = payload[0].payload
                      return (
                        <div className="bg-background border rounded-lg p-2 shadow-lg">
                          <p className="font-medium">{datum.status}</p>
                          <p className="text-sm text-muted-foreground">{datum.count} {t.ordersLower} ({datum.percentage?.toFixed(1)}%)</p>
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
          <CardTitle>{t.orderStatusDetails}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(data.orders?.statusBreakdown || []).map((status, index) => (
              <div key={status.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
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
  )
}


