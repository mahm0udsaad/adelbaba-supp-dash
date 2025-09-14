"use client"

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Trash2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

interface Attribute {
  name: string;
  values: string[];
}

interface Sku {
  id?: number;
  code: string;
  price: string;
  inventory: number;
  attributes: { name: string; value: string }[];
}

interface SkuManagerProps {
  skus: Sku[];
  setSkus: (skus: Sku[]) => void;
}

// Helper to generate cartesian product for SKUs
function cartesian(args: string[][]): string[][] {
    const r: string[][] = [], max = args.length - 1;
    function helper(arr: string[], i: number) {
        for (let j = 0, l = args[i].length; j < l; j++) {
            const a = arr.slice(0); // clone arr
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

export function SkuManager({ skus, setSkus }: SkuManagerProps) {
  const { t } = useI18n();
  const [attributes, setAttributes] = useState<Attribute[]>([{ name: '', values: [''] }]);

  const generatedSkus = useMemo(() => {
    const validAttributes = attributes.filter(a => a.name && a.values.every(v => v));
    if (validAttributes.length === 0) return [];

    const attributeValues = validAttributes.map(a => a.values);
    const combinations = cartesian(attributeValues);

    return combinations.map(combo => {
      const skuAttrs = combo.map((value, index) => ({
        name: validAttributes[index].name,
        value
      }));
      const code = skuAttrs.map(a => a.value).join('-');
      return {
        code,
        price: '0',
        inventory: 0,
        attributes: skuAttrs
      };
    });
  }, [attributes]);

  useEffect(() => {
    setSkus(generatedSkus);
  }, [generatedSkus, setSkus]);

  const addAttribute = () => setAttributes([...attributes, { name: '', values: [''] }]);
  const removeAttribute = (index: number) => setAttributes(attributes.filter((_, i) => i !== index));
  const updateAttributeName = (index: number, name: string) => {
    const newAttributes = [...attributes];
    newAttributes[index].name = name;
    setAttributes(newAttributes);
  };
  const addAttributeValue = (attrIndex: number) => {
    const newAttributes = [...attributes];
    newAttributes[attrIndex].values.push('');
    setAttributes(newAttributes);
  };
  const removeAttributeValue = (attrIndex: number, valueIndex: number) => {
    const newAttributes = [...attributes];
    newAttributes[attrIndex].values = newAttributes[attrIndex].values.filter((_, i) => i !== valueIndex);
    setAttributes(newAttributes);
  };
  const updateAttributeValue = (attrIndex: number, valueIndex: number, value: string) => {
    const newAttributes = [...attributes];
    newAttributes[attrIndex].values[valueIndex] = value;
    setAttributes(newAttributes);
  };

  const updateSku = (skuIndex: number, field: 'price' | 'inventory', value: string | number) => {
      const newSkus = [...skus];
      newSkus[skuIndex][field] = value as any;
      setSkus(newSkus);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle>{t.productVariants}</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addAttribute}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t.addAttribute}
                </Button>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {attributes.map((attr, attrIndex) => (
            <div key={attrIndex} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                    <Input 
                        placeholder={t.attributeNamePlaceholder} 
                        value={attr.name} 
                        onChange={(e) => updateAttributeName(attrIndex, e.target.value)}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeAttribute(attrIndex)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
                <div className="pl-4 space-y-2">
                    {attr.values.map((value, valueIndex) => (
                        <div key={valueIndex} className="flex items-center gap-2">
                            <Input 
                                placeholder={t.attributeValuePlaceholder} 
                                value={value} 
                                onChange={(e) => updateAttributeValue(attrIndex, valueIndex, e.target.value)}
                            />
                            {attr.values.length > 1 && (
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeAttributeValue(attrIndex, valueIndex)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button type="button" variant="link" size="sm" onClick={() => addAttributeValue(attrIndex)}>
                        <Plus className="h-4 w-4 mr-1" />
                        {t.addValue}
                    </Button>
                </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {skus.length > 0 && (
          <Card>
              <CardHeader><CardTitle>{t.skus}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                  {skus.map((sku, skuIndex) => (
                      <div key={skuIndex} className="grid grid-cols-3 gap-4 items-center p-2 border rounded-md">
                          <Label>{sku.code}</Label>
                          <Input type="number" placeholder={t.price} value={sku.price} onChange={(e) => updateSku(skuIndex, 'price', e.target.value)} />
                          <Input type="number" placeholder={t.stock} value={sku.inventory} onChange={(e) => updateSku(skuIndex, 'inventory', Number(e.target.value))} />
                      </div>
                  ))}
              </CardContent>
          </Card>
      )}
    </div>
  );
}
