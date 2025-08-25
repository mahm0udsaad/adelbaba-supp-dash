"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useI18n } from "@/lib/i18n/context"

interface StatusFilterProps {
  value: string
  onChange: (value: string) => void
}

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  const { t } = useI18n()
  return (
    <div className="flex gap-4">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t.allStatuses}</SelectItem>
          <SelectItem value="active">{t.active}</SelectItem>
          <SelectItem value="paused">{t.paused}</SelectItem>
          <SelectItem value="completed">{t.completed}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}


