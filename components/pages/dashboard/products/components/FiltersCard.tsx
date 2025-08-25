import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Search } from "lucide-react"
import type { ProductFiltersState } from "./types"
import { useI18n } from "@/lib/i18n/context"

interface FiltersCardProps {
  filters: ProductFiltersState
  setFilters: (filters: ProductFiltersState) => void
  isArabic: boolean
  onRefresh: () => void
}

export function FiltersCard({ filters, setFilters, isArabic, onRefresh }: FiltersCardProps) {
  const { t } = useI18n()
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          {t.searchAndFilter}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.searchProducts}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
          <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
            <SelectTrigger>
              <SelectValue placeholder={t.status} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allStatuses}</SelectItem>
              <SelectItem value="active">{t.active}</SelectItem>
              <SelectItem value="draft">{t.draft}</SelectItem>
              <SelectItem value="archived">{t.archived}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
            <SelectTrigger>
              <SelectValue placeholder={t.category} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allCategories}</SelectItem>
              <SelectItem value="electronics">{t.electronics}</SelectItem>
              <SelectItem value="textiles">{t.textiles}</SelectItem>
              <SelectItem value="home-kitchen">{t.homeKitchen}</SelectItem>
              <SelectItem value="renewable-energy">{t.renewableEnergy}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={onRefresh} variant="outline" className="bg-transparent">
            {t.refresh}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


