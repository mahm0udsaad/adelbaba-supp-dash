"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"

export function CRMHeader({ onAddContact }: { onAddContact: () => void }) {
  const { t } = useI18n()
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t.crm}</h1>
        <p className="text-muted-foreground">{t.crmSubtitle}</p>
      </div>
      <Button onClick={onAddContact}>
        <Plus className="h-4 w-4 mr-2" />
        {t.addContact}
      </Button>
    </div>
  )
}


