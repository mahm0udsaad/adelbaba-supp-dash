import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Target } from "lucide-react"
import type { Ad } from "./types"
import { AdCard } from "./AdCard"
import { useI18n } from "@/lib/i18n/context"

interface AdsListProps {
  ads: Ad[]
  loading: boolean
  isArabic: boolean
  onCreateClick: () => void
}

export function AdsList({ ads, loading, isArabic, onCreateClick }: AdsListProps) {
  const { t } = useI18n()
  if (loading) {
    return (
      <div className="grid gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded" />
        ))}
      </div>
    )
  }

  if (ads.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">{t.noAdsFound}</h3>
          <p className="text-muted-foreground mb-4">{t.startByCreatingAd}</p>
          <Button onClick={onCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            {t.createAd}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6">
      {ads.map((ad) => (
        <AdCard key={ad.id} ad={ad} isArabic={isArabic} />
      ))}
    </div>
  )
}


