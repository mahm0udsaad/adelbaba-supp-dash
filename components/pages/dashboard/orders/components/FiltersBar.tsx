"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Search } from "lucide-react"
import type { OrdersFiltersState } from "./types"

interface FiltersBarProps {
  filters: OrdersFiltersState
  setFilters: (filters: OrdersFiltersState) => void
  searchPlaceholder: string
  labels: {
    search: string
    filter: string
    allStatus: string
    awaitingPayment: string
    inEscrow: string
    shipped: string
    delivered: string
    disputed: string
    refresh: string
  }
  onRefresh: () => void
}

export function FiltersBar({ filters, setFilters, searchPlaceholder, labels, onRefresh }: FiltersBarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          {labels.search} & {labels.filter}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
          <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{labels.allStatus}</SelectItem>
              <SelectItem value="awaiting_payment">{labels.awaitingPayment}</SelectItem>
              <SelectItem value="in_escrow">{labels.inEscrow}</SelectItem>
              <SelectItem value="shipped">{labels.shipped}</SelectItem>
              <SelectItem value="delivered">{labels.delivered}</SelectItem>
              <SelectItem value="disputed">{labels.disputed}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={onRefresh} variant="outline" className="bg-transparent">
            {labels.refresh}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


