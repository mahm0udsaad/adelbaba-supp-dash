"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"

interface GeneralInfo {
  name: string
  material: string
  [key: string]: string
}

interface Specification {
  name: string
  value: string
}

interface ShippingMethod {
  method: string
  time: string
  cost: string
}

interface ProductContentData {
  general: GeneralInfo
  specifications: Specification[]
  shipping: ShippingMethod[]
}

interface ProductContentProps {
  content: ProductContentData | null
  setContent: (content: ProductContentData | null) => void
}

export function ProductContent({ content, setContent }: ProductContentProps) {
  const { t } = useI18n()
  const [hasContent, setHasContent] = useState(!!content)

  // Sync hasContent with incoming content changes (e.g., Fill Sample Data)
  useEffect(() => {
    setHasContent(!!content)
  }, [content])

  // Initialize with empty content if enabling
  const enableContent = () => {
    setHasContent(true)
    setContent({
      general: { name: "", material: "" },
      specifications: [{ name: "", value: "" }],
      shipping: [{ method: "", time: "", cost: "" }]
    })
  }

  const disableContent = () => {
    setHasContent(false)
    setContent(null)
  }

  if (!hasContent) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t.productContent || "Product Content"}</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={enableContent}>
              <Plus className="h-4 w-4 mr-2" />
              {t.addContent || "Add Content"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t.productContentDescription || "Add detailed product specifications, general information, and shipping methods."}
          </p>
        </CardContent>
      </Card>
    )
  }

  const updateGeneral = (key: string, value: string) => {
    if (!content) return
    setContent({
      ...content,
      general: { ...content.general, [key]: value }
    })
  }

  const addGeneralField = () => {
    if (!content) return
    // Find the next available field number for a cleaner UX
    const existingFieldNumbers = Object.keys(content.general)
      .filter(key => key.startsWith('field_'))
      .map(key => parseInt(key.replace('field_', '')) || 0)
    const nextNumber = existingFieldNumbers.length > 0 
      ? Math.max(...existingFieldNumbers) + 1 
      : 1
    const newKey = `field_${nextNumber}`
    setContent({
      ...content,
      general: { ...content.general, [newKey]: "" }
    })
  }

  const removeGeneralField = (key: string) => {
    if (!content || key === 'name' || key === 'material') return
    const { [key]: removed, ...rest } = content.general
    setContent({
      ...content,
      general: rest
    })
  }

  const updateGeneralFieldName = (oldKey: string, newKeyRaw: string) => {
    if (!content) return
    const newKey = newKeyRaw.trim()
    if (!newKey || newKey === oldKey) return
    if (Object.prototype.hasOwnProperty.call(content.general, newKey)) return
    const { [oldKey]: oldValue, ...rest } = content.general
    setContent({
      ...content,
      general: { ...rest, [newKey]: oldValue }
    })
  }

  const updateSpecification = (index: number, field: 'name' | 'value', value: string) => {
    if (!content) return
    const newSpecs = [...content.specifications]
    newSpecs[index][field] = value
    setContent({ ...content, specifications: newSpecs })
  }

  const addSpecification = () => {
    if (!content) return
    setContent({
      ...content,
      specifications: [...content.specifications, { name: "", value: "" }]
    })
  }

  const removeSpecification = (index: number) => {
    if (!content) return
    setContent({
      ...content,
      specifications: content.specifications.filter((_, i) => i !== index)
    })
  }

  const updateShipping = (index: number, field: 'method' | 'time' | 'cost', value: string) => {
    if (!content) return
    const newShipping = [...content.shipping]
    newShipping[index][field] = value
    setContent({ ...content, shipping: newShipping })
  }

  const addShipping = () => {
    if (!content) return
    setContent({
      ...content,
      shipping: [...content.shipping, { method: "", time: "", cost: "" }]
    })
  }

  const removeShipping = (index: number) => {
    if (!content) return
    setContent({
      ...content,
      shipping: content.shipping.filter((_, i) => i !== index)
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t.productContent || "Product Content"}</CardTitle>
          <Button type="button" variant="ghost" size="sm" onClick={disableContent}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* General Information */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">{t.generalInfo || "General Information"}</Label>
            <Button type="button" variant="outline" size="sm" onClick={addGeneralField}>
              <Plus className="h-4 w-4 mr-2" />
              {t.addField || "Add Field"}
            </Button>
          </div>
          <div className="space-y-3">
            {Object.entries(content?.general || {}).map(([key, value]) => (
              <div key={key} className="grid grid-cols-3 gap-2 items-center">
                {(key === 'name' || key === 'material') ? (
                  <Input
                    placeholder={t.fieldName || "Field Name"}
                    value={key === 'name' ? (t.name || 'Name') : (t.material || 'Material')}
                    readOnly
                    disabled
                  />
                ) : (
                  <Input
                    placeholder={t.fieldName || "Field Name"}
                    defaultValue={key.startsWith('field_') ? '' : key}
                    onBlur={(e) => {
                      const newValue = e.target.value.trim()
                      if (newValue) {
                        updateGeneralFieldName(key, newValue)
                      } else if (!key.startsWith('field_')) {
                        // If user clears a custom field name, revert to original
                        e.target.value = key
                      }
                    }}
                  />
                )}
                <Input
                  placeholder={t.fieldValue || "Field Value"}
                  value={value}
                  onChange={(e) => updateGeneral(key, e.target.value)}
                />
                {key !== 'name' && key !== 'material' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeGeneralField(key)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Specifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">{t.specifications || "Specifications"}</Label>
            <Button type="button" variant="outline" size="sm" onClick={addSpecification}>
              <Plus className="h-4 w-4 mr-2" />
              {t.addSpecification || "Add Specification"}
            </Button>
          </div>
          <div className="space-y-3">
            {content?.specifications.map((spec, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 items-center">
                <Input
                  placeholder={t.specName || "Specification Name"}
                  value={spec.name}
                  onChange={(e) => updateSpecification(index, 'name', e.target.value)}
                />
                <Input
                  placeholder={t.specValue || "Specification Value"}
                  value={spec.value}
                  onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                />
                {content.specifications.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSpecification(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )) || []}
          </div>
        </div>

        {/* Shipping Methods */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">{t.shippingMethods || "Shipping Methods"}</Label>
            <Button type="button" variant="outline" size="sm" onClick={addShipping}>
              <Plus className="h-4 w-4 mr-2" />
              {t.addShippingMethod || "Add Shipping Method"}
            </Button>
          </div>
          <div className="space-y-3">
            {content?.shipping.map((shipping, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 items-center">
                <Input
                  placeholder={t.shippingMethod || "Method"}
                  value={shipping.method}
                  onChange={(e) => updateShipping(index, 'method', e.target.value)}
                />
                <Input
                  placeholder={t.shippingTime || "Time"}
                  value={shipping.time}
                  onChange={(e) => updateShipping(index, 'time', e.target.value)}
                />
                <Input
                  placeholder={t.shippingCost || "Cost"}
                  value={shipping.cost}
                  onChange={(e) => updateShipping(index, 'cost', e.target.value)}
                />
                {content.shipping.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeShipping(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )) || []}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}