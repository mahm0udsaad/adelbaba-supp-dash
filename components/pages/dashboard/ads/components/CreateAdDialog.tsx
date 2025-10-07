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
import type { NewAdFormState } from "./types"
import { useI18n } from "@/lib/i18n/context"
import { adsApi } from "@/src/services/ads-api"

interface CreateAdDialogProps {
  onSuccess: () => Promise<void> | void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateAdDialog({ onSuccess, open, onOpenChange }: CreateAdDialogProps) {
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
  const [adType, setAdType] = useState<"product" | "banner">("product")
  const [bannerType, setBannerType] = useState<"banner" | "slideshow">("banner")
  const [bannerLocation, setBannerLocation] = useState<"header" | "footer">("header")
  const [targetUrl, setTargetUrl] = useState("")
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)

  const handleCreate = async () => {
    try {
      // Basic validation
      if (!newAd.title || !newAd.budget || !newAd.startDate || !newAd.endDate) {
        toast({ title: t.error, description: t.missingRequiredFields, variant: "destructive" })
        return
      }
      if (adType === "product" && !newAd.productId) {
        toast({ title: t.error, description: t.selectProduct, variant: "destructive" })
        return
      }
      if (adType === "banner" && mediaFiles.length === 0) {
        toast({ title: t.error, description: t.uploadAtLeastOneImage, variant: "destructive" })
        return
      }
      setSubmitting(true)

      const payload = {
        ad_type: adType,
        ad: {
          title: newAd.title,
          banner_type: adType === "banner" ? bannerType : undefined,
          banner_location: adType === "banner" ? bannerLocation : undefined,
          target_url: adType === "banner" ? targetUrl : undefined,
          starts_at: newAd.startDate,
          ends_at: newAd.endDate,
          budget_type: "daily" as const,
          budget_amount: parseFloat(newAd.budget),
          target_keywords: newAd.targetKeywords.split(",").map((k) => k.trim()).filter(Boolean),
          product_id: adType === "product" ? Number(newAd.productId) : undefined,
        },
        media: adType === "banner" ? mediaFiles : undefined,
      }

      await adsApi.create(payload)
      toast({ title: t.adCreated, description: t.adCreatedDesc })
      setDialogOpen(false)
      setNewAd({ title: "", productId: "", budget: "", startDate: "", endDate: "", targetCountries: "", targetKeywords: "" })
      setMediaFiles([])
      setTargetUrl("")
      await onSuccess()
    } catch {
      toast({ title: t.error, description: t.failedToCreateAd, variant: "destructive" })
    } finally {
      setSubmitting(false)
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
          <div className="grid gap-2 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Type *</Label>
              <Select value={adType} onValueChange={(v) => setAdType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="banner">Banner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {adType === "banner" ? (
              <div className="space-y-1">
                <Label>Banner type *</Label>
                <Select value={bannerType} onValueChange={(v) => setBannerType(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">Banner</SelectItem>
                    <SelectItem value="slideshow">Slideshow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">{t.campaignTitle} *</Label>
            <Input id="title" value={newAd.title} onChange={(e) => setNewAd({ ...newAd, title: e.target.value })} required />
          </div>
          {adType === "product" ? (
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
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Location *</Label>
                <Select value={bannerLocation} onValueChange={(v) => setBannerLocation(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="header">Header</SelectItem>
                    <SelectItem value="footer">Footer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target URL</Label>
                <Input value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} placeholder="https://example.com" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Media *</Label>
                <Input type="file" multiple accept="image/*" onChange={(e) => setMediaFiles(Array.from(e.target.files || []))} />
              </div>
            </div>
          )}
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
            <Button onClick={handleCreate} className="flex-1" disabled={submitting}>{submitting ? t.creating : t.createCampaign}</Button>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="bg-transparent">{t.cancel}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


