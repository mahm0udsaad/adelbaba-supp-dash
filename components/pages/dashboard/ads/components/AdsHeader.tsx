import { useI18n } from "@/lib/i18n/context"

interface AdsHeaderProps {}

export function AdsHeader({}: AdsHeaderProps) {
  const { t } = useI18n()
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">{t.adsHeader}</h1>
      <p className="text-muted-foreground">{t.adsSubtitle}</p>
    </div>
  )
}


