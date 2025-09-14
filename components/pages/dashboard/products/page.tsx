"use client"

import { useCallback, useMemo, useState } from "react"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, CheckCircle, Edit, Archive, Package, XCircle } from "lucide-react"
import { FiltersCard } from "./components/FiltersCard"
import { StatsCards } from "./components/StatsCards"
import { ProductCard } from "./components/ProductCard"
import type { ProductListItem } from "@/src/services/types/product-types"
import { listProducts } from "@/src/services/products-api"
import { useApiWithFallback } from "@/hooks/useApiWithFallback"

// Note: The mock 'Product' type had a 'status' field which is not in the API's 'ProductListItem'.
// We will derive a status from the 'is_active' boolean field.
// The filter state needs to be updated to reflect this.
type ProductFiltersState = {
  search: string
  status: "all" | "active" | "inactive"
  category: string | "all"
}

export default function ProductsPage() {
  const [filters, setFilters] = useState<ProductFiltersState>({ search: "", status: "all", category: "all" })
  const { t, isArabic } = useI18n()

  const fetcher = useCallback(() => listProducts({ q: filters.search }).then(res => res.data), [filters.search]);
  const fallback = useCallback(async () => [], []);

  const { data: allProducts, loading, refetch } = useApiWithFallback({
    fetcher,
    fallback,
    deps: [filters.search],
  })

  const products = useMemo(() => {
    if (!allProducts) return []
    let filtered = [...allProducts]
    if (filters.status !== "all") {
      const isActive = filters.status === "active"
      filtered = filtered.filter((p) => p.is_active === isActive)
    }
    if (filters.category !== "all") {
      filtered = filtered.filter((p) => p.category.id.toString() === filters.category)
    }
    // The API handles search, but we can do client-side filtering as a fallback or for refinement
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      )
    }
    return filtered
  }, [allProducts, filters.status, filters.category, filters.search])

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusLabel = (isActive: boolean) => {
    return isActive ? t.active : t.inactive
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
          products.map((product: ProductListItem) => (
            <ProductCard
              key={product.id}
              product={product}
              isArabic={isArabic}
              getStatusIcon={() => getStatusIcon(product.is_active)}
              getStatusLabel={() => getStatusLabel(product.is_active)}
              getLowestPrice={() => product.shown_price} // Use shown_price directly
              onProductDeleted={refetch}
            />
          ))
        )}
      </div>
    </div>
  )
}
