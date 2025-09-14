import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Eye, Edit, MoreHorizontal, Package, Star, Trash2 } from "lucide-react"
import Link from "next/link"
import type { ProductListItem } from "@/src/services/types/product-types"
import type React from "react"
import { useI18n } from "@/lib/i18n/context"
import { useState } from "react"
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog"
import { deleteProduct } from "@/src/services/products-api"
import { toast } from "@/components/ui/use-toast"

interface ProductCardProps {
  product: ProductListItem
  isArabic: boolean
  getStatusIcon: () => React.ReactElement
  getStatusLabel: () => string
  getLowestPrice: () => string
  onProductDeleted: () => void
}

export function ProductCard({ product, isArabic, getStatusIcon, getStatusLabel, getLowestPrice, onProductDeleted }: ProductCardProps) {
  const { t } = useI18n()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleDelete = async () => {
    try {
      await deleteProduct(product.id)
      toast({ title: t.productDeleted, description: t.productDeletedSuccess })
      onProductDeleted()
    } catch (error) {
      toast({ title: t.error, description: t.productDeleteFailed, variant: "destructive" })
    }
  }

  return (
    <>
      <Card key={product.id} className="hover:shadow-md transition-shadow overflow-hidden border rounded-lg flex flex-col">
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg"
            }}
          />
          <div className="absolute top-2 right-2 flex gap-1 z-10">
            <Badge variant={product.is_active ? "default" : "destructive"} className="flex items-center gap-1">
              {getStatusIcon()}
              {getStatusLabel()}
            </Badge>
          </div>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground line-clamp-2 mb-1 h-12">{product.name}</h3>
              <p className="text-sm text-muted-foreground">{product.category.name}</p>
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
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-grow">{product.description}</p>
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t.price}</span>
              <span className="font-medium text-primary">{getLowestPrice()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t.moq}</span>
              <span className="font-medium">{product.moq} {product.unit}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t.stock}</span>
              <span className={`font-medium ${product.inventory < 100 ? "text-yellow-600" : "text-green-600"}`}>
                {product.inventory}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4 border-t pt-2">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400" />
              {product.rating?.toFixed(1) || 'N/A'} ({product.reviews_count} {t.reviews})
            </span>
            <span>
              <Package className="inline h-3 w-3 mr-1" /> {product.skus_count} {t.skus}
            </span>
          </div>
          <div className="flex gap-2 mt-auto">
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
      </Card>
      <DeleteConfirmationDialog 
        isOpen={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen} 
        onConfirm={handleDelete} 
      />
    </>
  )
}


