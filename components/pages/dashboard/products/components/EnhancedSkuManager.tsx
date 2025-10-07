"use client"

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, X, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

interface VariationValue {
  id: number;
  name: string;
  value: string;
}

interface Warehouse {
  id: number;
  name: string;
}

interface SkuAttribute {
  type: "select" | "color" | "image";
  variation_value_id: number;
  hex_color?: string; // Required if type is "color"
  image?: File; // Required if type is "image"
}

type MassUnit = "g" | "kg" | "lb" | "oz";
type DistanceUnit = "cm" | "in" | "ft" | "m" | "mm" | "yd";

interface SkuPackageDetails {
  mass_unit: MassUnit;
  weight: number;
  distance_unit: DistanceUnit;
  height: number;
  length: number;
  width: number;
}

interface SkuInventoryWarehouse {
  warehouse_id: number;
  on_hand: number;
  reserved: number;
  reorder_point: number;
  restock_level: number;
  track_inventory: boolean;
}

interface EnhancedSku {
  code: string;
  price: number;
  package_details: SkuPackageDetails;
  inventory: {
    warehouses: SkuInventoryWarehouse[];
  };
  attributes: SkuAttribute[];
}

interface AttributeVariation {
  name: string;
  type: "select" | "color" | "image";
  values: VariationValue[];
}

interface EnhancedSkuManagerProps {
  skus: EnhancedSku[];
  setSkus: (skus: EnhancedSku[]) => void;
  warehouses?: Warehouse[];
  variationValues?: VariationValue[];
}

// Helper to generate cartesian product for SKUs
function cartesian(args: any[][]): any[][] {
    const r: any[][] = [], max = args.length - 1;
    function helper(arr: any[], i: number) {
        for (let j = 0, l = args[i].length; j < l; j++) {
            const a = arr.slice(0);
            a.push(args[i][j]);
            if (i === max)
                r.push(a);
            else
                helper(a, i + 1);
        }
    }
    helper([], 0);
    return r;
}

export function EnhancedSkuManager({ skus, setSkus, warehouses = [], variationValues = [] }: EnhancedSkuManagerProps) {
  const { t } = useI18n();
  const [attributes, setAttributes] = useState<AttributeVariation[]>([]);
  const [expandedSkus, setExpandedSkus] = useState<Set<number>>(new Set());

  // Mock data - in real app, these would come from props or API
  const mockWarehouses: Warehouse[] = useMemo(() => (
    warehouses.length ? warehouses : [
      { id: 31, name: 'Main Warehouse' },
      { id: 32, name: 'Secondary Warehouse' }
    ]
  ), [warehouses]);

  const mockVariationValues: VariationValue[] = useMemo(() => (
    variationValues.length ? variationValues : [
      { id: 5, name: 'Size', value: 'Small' },
      { id: 6, name: 'Size', value: 'Medium' },
      { id: 7, name: 'Color', value: 'Red' },
      { id: 8, name: 'Color', value: 'Blue' },
      { id: 9, name: 'Style', value: 'Classic' },
      { id: 10, name: 'Style', value: 'Modern' }
    ]
  ), [variationValues]);

  const generatedSkus = useMemo(() => {
    const validAttributes = attributes.filter(a => a.name && a.values.length > 0);
    if (validAttributes.length === 0) return [];

    const attributeValueCombinations = validAttributes.map(a => a.values);
    const combinations = cartesian(attributeValueCombinations);

    return combinations.map(combo => {
      const skuAttributes: SkuAttribute[] = combo.map((value, index) => ({
        type: validAttributes[index].type,
        variation_value_id: value.id,
        ...(validAttributes[index].type === 'color' ? { hex_color: '#000000' } : {})
      }));
      
      const code = combo.map((value: VariationValue) => value.value).join('-').toUpperCase();
      
      return {
        code: `SKU_${code}`,
        price: 0,
        package_details: {
          mass_unit: 'lb',
          weight: 1,
          distance_unit: 'in',
          height: 1,
          length: 1,
          width: 1,
        },
        inventory: {
          warehouses: mockWarehouses.map(warehouse => ({
            warehouse_id: warehouse.id,
            on_hand: 0,
            reserved: 0,
            reorder_point: 5,
            restock_level: 20,
            track_inventory: true
          }))
        },
        attributes: skuAttributes
      };
    });
  }, [attributes, mockWarehouses]);

  useEffect(() => {
    if (attributes.length === 0) return;
    setSkus(generatedSkus);
  }, [generatedSkus, setSkus, attributes.length]);

  const addAttribute = () => {
    setAttributes([...attributes, { 
      name: '', 
      type: 'select',
      values: [] 
    }]);
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, field: keyof AttributeVariation, value: any) => {
    const newAttributes = [...attributes];
    newAttributes[index] = { ...newAttributes[index], [field]: value };
    setAttributes(newAttributes);
  };

  const addAttributeValue = (attrIndex: number, variationValueId: number) => {
    const variationValue = mockVariationValues.find(v => v.id === variationValueId);
    if (!variationValue) return;

    const newAttributes = [...attributes];
    if (!newAttributes[attrIndex].values.some(v => v.id === variationValueId)) {
      newAttributes[attrIndex].values.push(variationValue);
      setAttributes(newAttributes);
    }
  };

  const removeAttributeValue = (attrIndex: number, valueId: number) => {
    const newAttributes = [...attributes];
    newAttributes[attrIndex].values = newAttributes[attrIndex].values.filter(v => v.id !== valueId);
    setAttributes(newAttributes);
  };

  const updateSku = (skuIndex: number, field: 'price', value: number) => {
    const newSkus = [...skus];
    newSkus[skuIndex][field] = value;
    setSkus(newSkus);
  };

  const updateSkuAttribute = (skuIndex: number, attrIndex: number, field: string, value: any) => {
    const newSkus = [...skus];
    if (field === 'image' && value instanceof File) {
      newSkus[skuIndex].attributes[attrIndex].image = value;
    } else {
      (newSkus[skuIndex].attributes[attrIndex] as any)[field] = value;
    }
    setSkus(newSkus);
  };

  const updateSkuWarehouse = (skuIndex: number, warehouseIndex: number, field: keyof SkuInventoryWarehouse, value: any) => {
    const newSkus = [...skus];
    (newSkus[skuIndex].inventory.warehouses[warehouseIndex] as any)[field] = value;
    setSkus(newSkus);
  };

  const toggleSkuExpansion = (skuIndex: number) => {
    const newExpanded = new Set(expandedSkus);
    if (newExpanded.has(skuIndex)) {
      newExpanded.delete(skuIndex);
    } else {
      newExpanded.add(skuIndex);
    }
    setExpandedSkus(newExpanded);
  };

  return (
    <div className="space-y-6">
      {/* Attributes Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t.productVariants || "Product Variants"}</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addAttribute}>
              <Plus className="h-4 w-4 mr-2" />
              {t.addAttribute || "Add Attribute"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {attributes.map((attr, attrIndex) => (
            <div key={attrIndex} className="p-4 border rounded-lg space-y-3">
              <div className="grid grid-cols-3 gap-2 items-center">
                <Input 
                  placeholder={t.attributeName || "Attribute Name"} 
                  value={attr.name} 
                  onChange={(e) => updateAttribute(attrIndex, 'name', e.target.value)}
                />
                <Select value={attr.type} onValueChange={(v: any) => updateAttribute(attrIndex, 'type', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="select">{t.selectType || "Select"}</SelectItem>
                    <SelectItem value="color">{t.colorType || "Color"}</SelectItem>
                    <SelectItem value="image">{t.imageType || "Image"}</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeAttribute(attrIndex)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">{t.attributeValues || "Attribute Values"}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {mockVariationValues
                    .filter(v => !attr.values.some(av => av.id === v.id))
                    .map(value => (
                    <Button 
                      key={value.id}
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => addAttributeValue(attrIndex, value.id)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {value.value}
                    </Button>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {attr.values.map(value => (
                    <div key={value.id} className="flex items-center gap-1 px-2 py-1 bg-secondary rounded">
                      <span className="text-sm">{value.value}</span>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon"
                        className="h-4 w-4"
                        onClick={() => removeAttributeValue(attrIndex, value.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Generated SKUs */}
      {skus.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t.generatedSkus || "Generated SKUs"} ({skus.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {skus.map((sku, skuIndex) => (
              <div key={skuIndex} className="border rounded-lg">
                <Collapsible 
                  open={expandedSkus.has(skuIndex)}
                  onOpenChange={() => toggleSkuExpansion(skuIndex)}
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        {expandedSkus.has(skuIndex) ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                        <div>
                          <div className="font-medium">{sku.code}</div>
                          <div className="text-sm text-muted-foreground">
                            {sku.attributes.map(attr => {
                              const value = mockVariationValues.find(v => v.id === attr.variation_value_id);
                              return value?.value;
                            }).join(' × ')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${sku.price}</div>
                        <div className="text-sm text-muted-foreground">
                          Stock: {sku.inventory.warehouses.reduce((sum, w) => sum + w.on_hand, 0)}
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="p-4 border-t bg-muted/25 space-y-6">
                      {/* Basic SKU Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>{t.skuCode || "SKU Code"}</Label>
                          <Input value={sku.code} disabled />
                        </div>
                        <div>
                          <Label>{t.price || "Price"}</Label>
                          <Input 
                            type="number" 
                            value={sku.price} 
                            onChange={(e) => updateSku(skuIndex, 'price', Number(e.target.value) || 0)} 
                          />
                        </div>
                      </div>

                      {/* Package Details */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">{t.packageDetails || 'Package Details'}</Label>
                        <div className="grid grid-cols-6 gap-3">
                          <div className="col-span-2">
                            <Label className="text-xs">{t.massUnit || 'Mass Unit'}</Label>
                            <Select
                              value={sku.package_details.mass_unit}
                              onValueChange={(v: any) => {
                                const newSkus = [...skus];
                                (newSkus[skuIndex].package_details.mass_unit as any) = v;
                                setSkus(newSkus);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="g">g</SelectItem>
                                <SelectItem value="kg">kg</SelectItem>
                                <SelectItem value="lb">lb</SelectItem>
                                <SelectItem value="oz">oz</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">{t.weight || 'Weight'}</Label>
                            <Input
                              type="number"
                              value={sku.package_details.weight}
                              onChange={(e) => {
                                const newSkus = [...skus];
                                newSkus[skuIndex].package_details.weight = Number(e.target.value) || 0;
                                setSkus(newSkus);
                              }}
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs">{t.distanceUnit || 'Distance Unit'}</Label>
                            <Select
                              value={sku.package_details.distance_unit}
                              onValueChange={(v: any) => {
                                const newSkus = [...skus];
                                (newSkus[skuIndex].package_details.distance_unit as any) = v;
                                setSkus(newSkus);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cm">cm</SelectItem>
                                <SelectItem value="in">in</SelectItem>
                                <SelectItem value="ft">ft</SelectItem>
                                <SelectItem value="m">m</SelectItem>
                                <SelectItem value="mm">mm</SelectItem>
                                <SelectItem value="yd">yd</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">{t.height || 'Height'}</Label>
                            <Input
                              type="number"
                              value={sku.package_details.height}
                              onChange={(e) => {
                                const newSkus = [...skus];
                                newSkus[skuIndex].package_details.height = Number(e.target.value) || 0;
                                setSkus(newSkus);
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">{t.length || 'Length'}</Label>
                            <Input
                              type="number"
                              value={sku.package_details.length}
                              onChange={(e) => {
                                const newSkus = [...skus];
                                newSkus[skuIndex].package_details.length = Number(e.target.value) || 0;
                                setSkus(newSkus);
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">{t.width || 'Width'}</Label>
                            <Input
                              type="number"
                              value={sku.package_details.width}
                              onChange={(e) => {
                                const newSkus = [...skus];
                                newSkus[skuIndex].package_details.width = Number(e.target.value) || 0;
                                setSkus(newSkus);
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Attributes */}
                      <div>
                        <Label className="text-sm font-medium">{t.attributes || "Attributes"}</Label>
                        <div className="space-y-3 mt-2">
                          {sku.attributes.map((attr, attrIndex) => {
                            const variationValue = mockVariationValues.find(v => v.id === attr.variation_value_id);
                            return (
                              <div key={attrIndex} className="grid grid-cols-3 gap-2 items-center">
                                <div className="text-sm">{variationValue?.value}</div>
                                <div className="text-sm text-muted-foreground">{attr.type}</div>
                                <div>
                                  {attr.type === 'color' && (
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="color"
                                        value={attr.hex_color || '#000000'}
                                        onChange={(e) => updateSkuAttribute(skuIndex, attrIndex, 'hex_color', e.target.value)}
                                        className="w-8 h-8 rounded border"
                                      />
                                      <Input
                                        value={attr.hex_color || '#000000'}
                                        onChange={(e) => updateSkuAttribute(skuIndex, attrIndex, 'hex_color', e.target.value)}
                                        placeholder="#000000"
                                        className="flex-1"
                                      />
                                    </div>
                                  )}
                                  {attr.type === 'image' && (
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) updateSkuAttribute(skuIndex, attrIndex, 'image', file);
                                      }}
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Inventory by Warehouse */}
                      <div>
                        <Label className="text-sm font-medium">{t.inventory || "Inventory"}</Label>
                        <div className="space-y-3 mt-2">
                          {sku.inventory.warehouses.map((warehouse, warehouseIndex) => {
                            const warehouseInfo = mockWarehouses.find(w => w.id === warehouse.warehouse_id);
                            return (
                              <div key={warehouseIndex} className="p-3 border rounded-md space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium">{warehouseInfo?.name}</h4>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox 
                                      checked={warehouse.track_inventory}
                                      onCheckedChange={(checked) => 
                                        updateSkuWarehouse(skuIndex, warehouseIndex, 'track_inventory', Boolean(checked))
                                      }
                                    />
                                    <Label className="text-sm">{t.trackInventory || "Track Inventory"}</Label>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-4 gap-2">
                                  <div>
                                    <Label className="text-xs">{t.onHand || "On Hand"}</Label>
                                    <Input
                                      type="number"
                                      value={warehouse.on_hand}
                                      onChange={(e) => updateSkuWarehouse(skuIndex, warehouseIndex, 'on_hand', Number(e.target.value) || 0)}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">{t.reserved || "Reserved"}</Label>
                                    <Input
                                      type="number"
                                      value={warehouse.reserved}
                                      onChange={(e) => updateSkuWarehouse(skuIndex, warehouseIndex, 'reserved', Number(e.target.value) || 0)}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">{t.reorderPoint || "Reorder Point"}</Label>
                                    <Input
                                      type="number"
                                      value={warehouse.reorder_point}
                                      onChange={(e) => updateSkuWarehouse(skuIndex, warehouseIndex, 'reorder_point', Number(e.target.value) || 0)}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">{t.restockLevel || "Restock Level"}</Label>
                                    <Input
                                      type="number"
                                      value={warehouse.restock_level}
                                      onChange={(e) => updateSkuWarehouse(skuIndex, warehouseIndex, 'restock_level', Number(e.target.value) || 0)}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
