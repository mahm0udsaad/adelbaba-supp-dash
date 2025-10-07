import { useI18n } from "@/lib/i18n/context"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { adsApi } from "@/src/services/ads-api"

interface ExportState {
  date_from: string
  date_to: string
  format: "csv" | "xlsx"
}

interface AdsHeaderProps { onExportComplete?: () => void }

export function AdsHeader({ onExportComplete }: AdsHeaderProps) {
  const { t } = useI18n()
  const [state, setState] = useState<ExportState>({ date_from: "", date_to: "", format: "xlsx" })
  const [downloading, setDownloading] = useState(false)

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }

  const handleExport = async () => {
    try {
      setDownloading(true)
      const blob = await adsApi.exportAll({ ...state })
      const ext = state.format === "csv" ? "csv" : "xlsx"
      downloadBlob(blob, `ads.${ext}`)
      onExportComplete?.()
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t.adsHeader}</h1>
        <p className="text-muted-foreground">{t.adsSubtitle}</p>
      </div>
      <div className="flex gap-2 items-end">
        <input type="date" className="border rounded px-2 py-1" value={state.date_from} onChange={(e) => setState({ ...state, date_from: e.target.value })} />
        <input type="date" className="border rounded px-2 py-1" value={state.date_to} onChange={(e) => setState({ ...state, date_to: e.target.value })} />
        <select className="border rounded px-2 py-1" value={state.format} onChange={(e) => setState({ ...state, format: e.target.value as any })}>
          <option value="xlsx">XLSX</option>
          <option value="csv">CSV</option>
        </select>
        <Button onClick={handleExport} disabled={downloading}>
          {downloading ? t.downloading : t.export}
        </Button>
      </div>
    </div>
  )
}


