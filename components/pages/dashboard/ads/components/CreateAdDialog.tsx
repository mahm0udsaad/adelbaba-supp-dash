"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { NewAdFormState, Ad } from "./types"
import { useI18n } from "@/lib/i18n/context"

interface CreateAdDialogProps {
  onCreate: (ad: Ad) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateAdDialog({ onCreate, open, onOpenChange }: CreateAdDialogProps) {
  const { t } = useI18n()
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = typeof open === "boolean"
  const dialogOpen = isControlled ? (open as boolean) : internalOpen
  const setDialogOpen = (value: boolean) => (isControlled ? onOpenChange?.(value) : setInternalOpen(value))
  const [newAd, setNewAd] = useState<NewAdFormState>({
    title: "",
    productId: "",
    budget: "",
    startDate: "",
    endDate: "",
    targetCountries: "",
    targetKeywords: "",
  })

  const handleCreate = () => {
    try {
      const adData: Ad = {
        id: String(Date.now()),
        title: newAd.title,
        productId: newAd.productId,
        productName: "New Product",
        budget: Number.parseFloat(newAd.budget),
        spent: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        ctr: 0,
        cpc: 0,
        startDate: newAd.startDate,
        endDate: newAd.endDate,
        targetCountries: newAd.targetCountries.split(",").map((c) => c.trim()).filter(Boolean),
        targetKeywords: newAd.targetKeywords.split(",").map((k) => k.trim()).filter(Boolean),
        type: "product",
        status: "active",
      }

      onCreate(adData)
      toast({
        title: t.adCreated,
        description: t.adCreatedDesc,
      })
      setDialogOpen(false)
      setNewAd({
        title: "",
        productId: "",
        budget: "",
        startDate: "",
        endDate: "",
        targetCountries: "",
        targetKeywords: "",
      })
    } catch {
      toast({
        title: t.error,
        description: t.failedToCreateAd,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t.createAd}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.createNewAdCampaign}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t.campaignTitle} *</Label>
            <Input id="title" value={newAd.title} onChange={(e) => setNewAd({ ...newAd, title: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="productId">{t.product} *</Label>
            <Select value={newAd.productId} onValueChange={(value) => setNewAd({ ...newAd, productId: value })}>
              <SelectTrigger>
                <SelectValue placeholder={t.selectProduct} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Wireless Bluetooth Headphones</SelectItem>
                <SelectItem value="2">Smart Fitness Watch</SelectItem>
                <SelectItem value="3">Portable Power Bank</SelectItem>
                <SelectItem value="4">Gaming Mouse Pad</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget">{t.budget} *</Label>
            <Input id="budget" type="number" value={newAd.budget} onChange={(e) => setNewAd({ ...newAd, budget: e.target.value })} required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t.startDate} *</Label>
              <Input id="startDate" type="date" value={newAd.startDate} onChange={(e) => setNewAd({ ...newAd, startDate: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">{t.endDate} *</Label>
              <Input id="endDate" type="date" value={newAd.endDate} onChange={(e) => setNewAd({ ...newAd, endDate: e.target.value })} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetCountries">{t.targetCountries}</Label>
            <Input id="targetCountries" placeholder={t.egCountries} value={newAd.targetCountries} onChange={(e) => setNewAd({ ...newAd, targetCountries: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetKeywords">{t.targetKeywords}</Label>
            <Textarea id="targetKeywords" placeholder={t.egKeywords} value={newAd.targetKeywords} onChange={(e) => setNewAd({ ...newAd, targetKeywords: e.target.value })} rows={3} />
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleCreate} className="flex-1">{t.createCampaign}</Button>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="bg-transparent">{t.cancel}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


