"use client"

import { useMemo, useState } from "react"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, CheckCircle, Edit, Archive, Package } from "lucide-react"
import { FiltersCard } from "./components/FiltersCard"
import { StatsCards } from "./components/StatsCards"
import { ProductCard } from "./components/ProductCard"
import type { Product, ProductFiltersState } from "./components/types"
import { useMockData } from "@/lib/mock-data-context"

export default function ProductsPage() {
  const [filters, setFilters] = useState<ProductFiltersState>({ search: "", status: "all", category: "all" })
  const { t, isArabic } = useI18n()
  const { products: allProducts } = useMockData()

  const products = useMemo(() => {
    let filtered = [...(allProducts as Product[])]
    if (filters.status !== "all") filtered = filtered.filter((p) => p.status === filters.status)
    if (filters.category !== "all") filtered = filtered.filter((p) => p.categoryId === filters.category)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.sku.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
      )
    }
    return filtered
  }, [allProducts, filters])

  const loading = false
  const refetch = () => Promise.resolve()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />
      case "draft":
        return <Edit className="h-4 w-4" />
      case "archived":
        return <Archive className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return t.active
      case "draft":
        return t.draft
      case "archived":
        return t.archived
      default:
        return status
    }
  }

  const getLowestPrice = (pricingTiers: Product["pricingTiers"]) => {
    if (!pricingTiers || pricingTiers.length === 0) return 0
    return Math.min(...pricingTiers.map((tier) => tier.unitPrice))
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t.productsHeader}</h1>
          <p className="text-muted-foreground">{t.manageCatalog}</p>
        </div>
        <Link href="/dashboard/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t.addProduct}
          </Button>
        </Link>
      </div>

      <StatsCards products={products || []} />

      <FiltersCard filters={filters} setFilters={setFilters} isArabic={isArabic} onRefresh={refetch} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !products || products.length === 0 ? (
          <div className="col-span-full">
            <div className="flex flex-col items-center justify-center py-8 border rounded-lg">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">{t.noProductsFound}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t.tryAdjustingSearchOrAdd}</p>
                <Link href="/dashboard/products/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t.addProduct}
                  </Button>
                </Link>
            </div>
          </div>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isArabic={isArabic}
              getStatusIcon={getStatusIcon}
              getStatusLabel={getStatusLabel}
              getLowestPrice={getLowestPrice}
            />
          ))
        )}
      </div>
    </div>
  )
}
