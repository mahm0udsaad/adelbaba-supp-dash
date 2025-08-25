import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"

interface AnalyticsHeaderProps {
  period: string
  onPeriodChange: (value: string) => void
}

export function AnalyticsHeader({ period, onPeriodChange }: AnalyticsHeaderProps) {
  const { t } = useI18n()
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t.analyticsHeader}</h1>
        <p className="text-muted-foreground">{t.trackPerformance}</p>
      </div>
      <div className="flex gap-2">
        <Select value={period} onValueChange={onPeriodChange}>
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
  )
}


