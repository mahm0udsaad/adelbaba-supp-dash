export const COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6"]

export function createChartConfig(isArabic: boolean) {
  // label strings come from t in components; keep only colors here
  return {
    revenue: { label: "revenue", color: "#f59e0b" },
    orders: { label: "orders", color: "#10b981" },
    count: { label: "count", color: "#3b82f6" },
    status: { label: "status", color: "#8b5cf6" },
    percentage: { label: "percentage", color: "#ef4444" },
  }
}

