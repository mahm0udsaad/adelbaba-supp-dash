"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Eye, FileText, Loader2, Plus, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { certificatesApi, type CertificateItem, type PaginatedResponse } from "@/src/services/certificates"

type Props = {
  items: CertificateItem[]
  meta: PaginatedResponse<CertificateItem>["meta"] | null
  links: PaginatedResponse<CertificateItem>["links"] | null
  onRefresh: (page?: number) => Promise<void>
  onMarkUploaded: () => void
}

export default function CertificatesStep({ items, meta, links, onRefresh, onMarkUploaded }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<{ 
    typeId: string; 
    issuedAt: Date | undefined; 
    expiresAt: Date | undefined; 
    files: File[] 
  }>({
    typeId: "",
    issuedAt: undefined,
    expiresAt: undefined,
    files: [],
  })

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      if (!form.typeId || !form.issuedAt || !form.expiresAt || form.files.length === 0) {
        toast({ title: "Missing fields", description: "Please fill all fields and attach at least one document.", variant: "destructive" })
        setSaving(false)
        return
      }

      // Format dates as YYYY-MM-DD for the API
      const issuedAtFormatted = format(form.issuedAt, "yyyy-MM-dd")
      const expiresAtFormatted = format(form.expiresAt, "yyyy-MM-dd")

      await certificatesApi.create({
        certificate_type_id: form.typeId,
        issued_at: issuedAtFormatted,
        expires_at: expiresAtFormatted,
        documents: form.files,
      })
      await onRefresh(1)
      onMarkUploaded()
      setDialogOpen(false)
      setForm({ typeId: "", issuedAt: undefined, expiresAt: undefined, files: [] })
      toast({ title: "Certificate added", description: "Your certificate has been uploaded." })
    } catch (e: any) {
      let desc = "Could not add certificate."
      const data = e?.response?.data
      if (data) {
        if (typeof data === 'string') desc = data
        else if (typeof data?.message === 'string') desc = data.message
        else if (data?.errors) {
          const firstKey = Object.keys(data.errors)[0]
          const firstMsg = Array.isArray(data.errors[firstKey]) ? data.errors[firstKey][0] : String(data.errors[firstKey])
          desc = firstMsg || desc
        }
      } else if (e?.message) {
        desc = e.message
      }
      const hint = `${desc} Please review the fields and try again.`
      setError(hint)
      toast({ title: "Upload failed", description: hint, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const DatePickerField = ({ 
    label, 
    value, 
    onChange, 
    placeholder = "Pick a date" 
  }: { 
    label: string; 
    value: Date | undefined; 
    onChange: (date: Date | undefined) => void;
    placeholder?: string;
  }) => {
    return (
      <div>
        <Label>{label}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !value && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(value, "PPP") : <span>{placeholder}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value}
              onSelect={onChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2 text-gray-900">Certificates</h3>
        <p className="text-gray-600">Upload compliance and quality documents</p>
      </div>

      {items.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-orange-400 transition-colors">
          <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h4>
          <p className="text-gray-600 mb-4">Add certificates to build trust with buyers</p>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (open) setError(null) }}>
            <DialogTrigger asChild>
              <Button disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Certificate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Certificate</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label htmlFor="cert-type">Certificate Type ID</Label>
                  <Input id="cert-type" value={form.typeId} onChange={(e) => setForm((p) => ({ ...p, typeId: e.target.value }))} />
                </div>
                <div className="space-y-4">
                  <DatePickerField
                    label="Issued At"
                    value={form.issuedAt}
                    onChange={(date) => setForm((p) => ({ ...p, issuedAt: date }))}
                    placeholder="Select issue date"
                  />
                  <DatePickerField
                    label="Expires At"
                    value={form.expiresAt}
                    onChange={(date) => setForm((p) => ({ ...p, expiresAt: date }))}
                    placeholder="Select expiry date"
                  />
                </div>
                <div>
                  <Label htmlFor="cert-files">Documents</Label>
                  <Input id="cert-files" type="file" multiple accept="application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf,.odt" onChange={(e) => setForm((p) => ({ ...p, files: Array.from(e.target.files || []) }))} />
                  <p className="text-xs text-gray-500 mt-1">pdf/doc/xls/ppt/txt/csv/rtf/odt</p>
                </div>
              </div>
              {error && (
                <p className="text-sm text-red-600 mt-2">{error}</p>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button disabled={saving} onClick={handleSave}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">{items.length} certificates uploaded</p>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (open) setError(null) }}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add Certificate
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Certificate</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div>
                    <Label htmlFor="cert-type">Certificate Type ID</Label>
                    <Input id="cert-type" value={form.typeId} onChange={(e) => setForm((p) => ({ ...p, typeId: e.target.value }))} />
                  </div>
                  <div className="space-y-4">
                    <DatePickerField
                      label="Issued At"
                      value={form.issuedAt}
                      onChange={(date) => setForm((p) => ({ ...p, issuedAt: date }))}
                      placeholder="Select issue date"
                    />
                    <DatePickerField
                      label="Expires At"
                      value={form.expiresAt}
                      onChange={(date) => setForm((p) => ({ ...p, expiresAt: date }))}
                      placeholder="Select expiry date"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cert-files">Documents</Label>
                    <Input id="cert-files" type="file" multiple accept="application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf,.odt" onChange={(e) => setForm((p) => ({ ...p, files: Array.from(e.target.files || []) }))} />
                    <p className="text-xs text-gray-500 mt-1">pdf/doc/xls/ppt/txt/csv/rtf/odt</p>
                  </div>
                </div>
                {error && (
                  <p className="text-sm text-red-600 mt-2">{error}</p>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button disabled={saving} onClick={handleSave}>
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {items.map((cert) => (
              <Card key={String(cert.id)} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{cert.name || `Certificate #${cert.id}`}</h4>
                    <p className="text-sm text-gray-600">{cert.issuer || ""}</p>
                    <div className="flex gap-4 text-xs text-gray-500 mt-1">
                      {cert.issue_date && <span>Issued: {cert.issue_date}</span>}
                      {cert.expiry_date && <span>Expires: {cert.expiry_date}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {cert.file_url && (
                      <a href={cert.file_url} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {meta && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-sm text-gray-500">Page {meta.current_page} of {meta.last_page}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!links?.prev}
                  onClick={() => onRefresh(Math.max(1, (meta.current_page || 1) - 1))}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!links?.next}
                  onClick={() => onRefresh(Math.min(meta.last_page || (meta.current_page || 1), (meta.current_page || 1) + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
