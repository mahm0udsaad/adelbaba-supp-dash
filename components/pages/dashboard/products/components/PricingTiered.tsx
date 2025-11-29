"use client"

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

interface Tier {
  min_quantity: number;
  price: number;
}

interface PricingTieredProps {
  tiers: Tier[];
  setTiers: (tiers: Tier[]) => void;
}

export function PricingTiered({ tiers, setTiers }: PricingTieredProps) {
  const { t } = useI18n();

  useEffect(() => {
    if (tiers.length === 0) {
        setTiers([{ min_quantity: 0, price: 0 }]);
    }
  }, []);

  const addTier = () => {
    setTiers([...tiers, { min_quantity: 0, price: 0 }]);
  };

  const removeTier = (index: number) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const updateTier = (index: number, field: keyof Tier, value: number) => {
    const updatedTiers = [...tiers];
    updatedTiers[index][field] = value;
    setTiers(updatedTiers);
  };

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="font-medium">{t.tieredPricing}</h3>
            <Button type="button" variant="outline" size="sm" onClick={addTier}>
                <Plus className="h-4 w-4 mr-2" />
                {t.addTier}
            </Button>
        </div>
      {tiers.map((tier, index) => (
        <div key={index} className="grid gap-2 md:grid-cols-3 items-end">
          <div className="space-y-1">
            <Label className="text-xs">{t.minQuantity}</Label>
            <Input
              type="number"
              placeholder="0"
              value={tier.min_quantity || ''}
              onChange={(e) => updateTier(index, 'min_quantity', Number.parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t.unitPrice}</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={tier.price || ''}
              onChange={(e) => updateTier(index, 'price', Number.parseFloat(e.target.value) || 0)}
            />
          </div>
          {tiers.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeTier(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
