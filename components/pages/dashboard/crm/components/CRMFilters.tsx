"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"

export function CRMFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onMoreFilters,
}: {
  searchTerm: string
  setSearchTerm: (v: string) => void
  statusFilter: string
  setStatusFilter: (v: string) => void
  onMoreFilters?: () => void
}) {
  const { t } = useI18n()
  return (
    <div className="flex gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t.searchContacts}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t.allStatuses}</SelectItem>
          <SelectItem value="active">{t.active}</SelectItem>
          <SelectItem value="prospect">{t.prospect}</SelectItem>
          <SelectItem value="inactive">{t.inactive}</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" className="bg-transparent" onClick={onMoreFilters}>
        <Filter className="h-4 w-4 mr-2" />
        {t.moreFilters}
      </Button>
    </div>
  )
}


