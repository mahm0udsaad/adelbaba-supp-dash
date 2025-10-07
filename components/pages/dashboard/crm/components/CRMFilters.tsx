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
  sortBy,
  setSortBy,
  buyerType,
  setBuyerType,
  hasOrders,
  setHasOrders,
  tags,
  setTags,
}: {
  searchTerm: string
  setSearchTerm: (v: string) => void
  statusFilter: string
  setStatusFilter: (v: string) => void
  sortBy?: string
  setSortBy: (v: string) => void
  buyerType?: string
  setBuyerType: (v: string) => void
  hasOrders?: boolean | undefined
  setHasOrders: (v: boolean | undefined) => void
  tags?: string
  setTags: (v: string) => void
}) {
  const { t } = useI18n()
  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t.searchContacts}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap gap-3">
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

        <Select value={sortBy || "-updated_at"} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-updated_at">Updated (newest)</SelectItem>
            <SelectItem value="updated_at">Updated (oldest)</SelectItem>
            <SelectItem value="-placed_orders">Orders (high)</SelectItem>
            <SelectItem value="placed_orders">Orders (low)</SelectItem>
            <SelectItem value="-total_spent">Spent (high)</SelectItem>
            <SelectItem value="total_spent">Spent (low)</SelectItem>
            <SelectItem value="customer_name">Name</SelectItem>
          </SelectContent>
        </Select>

        <Select value={buyerType || "all"} onValueChange={(v) => setBuyerType(v === "all" ? "" : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Buyer type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="repeated">Repeated</SelectItem>
          </SelectContent>
        </Select>

        <Select value={(hasOrders === undefined ? "all" : hasOrders ? "true" : "false")} onValueChange={(v) => setHasOrders(v === "all" ? undefined : v === "true") }>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Has orders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder={"Tags (comma separated)"}
          value={tags || ""}
          onChange={(e) => setTags(e.target.value)}
          className="max-w-xs"
        />
      </div>
    </div>
  )
}


