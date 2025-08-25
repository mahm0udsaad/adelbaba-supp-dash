import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, Edit, MoreHorizontal, Package } from "lucide-react"
import Link from "next/link"
import { statusColors, visibilityColors } from "./constants"
import type { Product } from "./types"
import type React from "react"
import { useI18n } from "@/lib/i18n/context"

interface ProductCardProps {
  product: Product
  isArabic: boolean
  getStatusIcon: (status: string) => React.ReactElement
  getStatusLabel: (status: string) => string
  getLowestPrice: (pricingTiers: Product["pricingTiers"]) => number
}

export function ProductCard({ product, isArabic, getStatusIcon, getStatusLabel, getLowestPrice }: ProductCardProps) {
  const { t } = useI18n()
  return (
    <Card key={product.id} className="hover:shadow-md transition-shadow overflow-hidden border-0 rounded-lg">
      <div className="w-full h-full">
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          <img
            src={product.images?.[0] || "/placeholder.svg"}
            alt={product.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg"
            }}
          />
          <div className="absolute top-2 right-2 flex gap-1 z-10">
            <Badge className={statusColors[product.status]}> 
              <div className="flex items-center gap-1">
                {getStatusIcon(product.status)}
                {getStatusLabel(product.status)}
              </div>
            </Badge>
            <Badge variant="outline" className={visibilityColors[product.visibility]}> 
              {product.visibility === "public" ? t.public : t.private}
            </Badge>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground line-clamp-2 mb-1">{product.title}</h3>
              <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/products/${product.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    {t.view}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/products/${product.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    {t.edit}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t.priceFrom}</span>
              <span className="font-medium text-primary">${getLowestPrice(product.pricingTiers)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t.moq}</span>
              <span className="font-medium">{product.moq}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t.stock}</span>
              <span className={`font-medium ${product.totalStock < 100 ? "text-yellow-600" : "text-green-600"}`}>
                {product.totalStock}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <span>
              <Package className="inline h-3 w-3 mr-1" /> {product.views} {t.views}
            </span>
            <span>{product.inquiries} {t.inquiries}</span>
            <span>{product.orders} {t.ordersLower}</span>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/products/${product.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                <Eye className="h-4 w-4 mr-2" />
                {t.view}
              </Button>
            </Link>
            <Link href={`/dashboard/products/${product.id}/edit`} className="flex-1">
              <Button size="sm" className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                {t.edit}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  )
}


