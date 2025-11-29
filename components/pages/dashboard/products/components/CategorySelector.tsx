"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight, ArrowLeft, Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/lib/i18n/context"
import { listRootCategories, listCategoryChildren, Category } from "@/src/services/categories-api"
import { toast } from "sonner"

interface CategorySelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (categoryId: string, categoryName: string, parentName?: string) => void
  selectedCategoryId?: string
}

export function CategorySelector({ open, onOpenChange, onSelect, selectedCategoryId }: CategorySelectorProps) {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'parent' | 'child'>('parent')
  const [parentCategories, setParentCategories] = useState<Category[]>([])
  const [childCategories, setChildCategories] = useState<Category[]>([])
  const [selectedParent, setSelectedParent] = useState<Category | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch parent categories on mount
  useEffect(() => {
    if (open) {
      fetchParentCategories()
      setStep('parent')
      setSearchQuery("")
    }
  }, [open])

  const fetchParentCategories = async () => {
    setLoading(true)
    try {
      const response = await listRootCategories()
      setParentCategories(response.data || [])
      
      if (response.data.length === 0) {
        toast.info(t.noCategoriesFoundToast, {
          description: t.contactSupportToAddCategories
        })
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error(t.failedToLoadCategories, {
        description: t.couldNotFetchCategories
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchChildCategories = async (parentId: number) => {
    setLoading(true)
    try {
      const response = await listCategoryChildren(parentId)
      setChildCategories(response.data || [])
      if (response.data.length === 0) {
        toast.info(t.noSubcategoriesAvailable, {
          description: t.thisIsALeafCategory,
          duration: 3000
        })
      }
    } catch (error) {
      console.error('Failed to fetch child categories:', error)
      toast.error(t.failedToLoadSubcategories, {
        description: t.couldNotFetchSubcategories
      })
    } finally {
      setLoading(false)
    }
  }

  const handleParentClick = async (category: Category) => {
    setSelectedParent(category)
    await fetchChildCategories(category.id)
    setStep('child')
  }

  const handleChildClick = (category: Category) => {
    onSelect(String(category.id), category.name, selectedParent?.name)
    toast.success(t.categorySelected, {
      description: selectedParent?.name 
        ? `${selectedParent.name} → ${category.name}`
        : category.name,
      duration: 3000
    })
    onOpenChange(false)
    // Reset state
    setStep('parent')
    setSelectedParent(null)
    setChildCategories([])
    setSearchQuery("")
  }

  const handleSelectParentOnly = () => {
    if (selectedParent) {
      onSelect(String(selectedParent.id), selectedParent.name)
      toast.success(t.categorySelected, {
        description: selectedParent.name,
        duration: 3000
      })
      onOpenChange(false)
      // Reset state
      setStep('parent')
      setSelectedParent(null)
      setChildCategories([])
      setSearchQuery("")
    }
  }

  const handleBack = () => {
    setStep('parent')
    setSelectedParent(null)
    setChildCategories([])
    setSearchQuery("")
  }

  const filteredCategories = step === 'parent'
    ? parentCategories.filter(cat => 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : childCategories.filter(cat => 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'child' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <span>
              {step === 'parent' 
                ? t.selectCategory
                : t.selectSubcategory}
            </span>
          </DialogTitle>
          {step === 'child' && selectedParent && (
            <DialogDescription>
              {t.parentCategory} <strong>{selectedParent.name}</strong>
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.searchCategories}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Categories Grid */}
          {!loading && (
            <ScrollArea className="flex-1 -mx-6 px-6 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 pb-4">
                {filteredCategories.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    {searchQuery 
                      ? t.noCategoriesFound
                      : t.noCategoriesAvailable}
                  </div>
                ) : (
                  filteredCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        if (step === 'parent') {
                          handleParentClick(category)
                        } else {
                          handleChildClick(category)
                        }
                      }}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent hover:border-primary transition-colors text-left group"
                    >
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "https://placehold.co/200?text=No+Image"
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {category.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          ID: {category.id}
                        </p>
                      </div>
                      {step === 'parent' && (
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          )}

          {/* Select Parent Only Option */}
          {step === 'child' && childCategories.length === 0 && !loading && selectedParent && (
            <div className="border-t pt-4 space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                {t.noSubcategories}
              </p>
              <Button
                onClick={handleSelectParentOnly}
                className="w-full"
              >
                {`${t.select} "${selectedParent.name}"`}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

