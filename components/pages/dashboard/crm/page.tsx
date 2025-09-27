"use client"

import { useEffect, useState } from "react"
import { toast } from "@/hooks/use-toast"
import { CRMHeader } from "./components/CRMHeader"
import { CRMFilters } from "./components/CRMFilters"
import { AddContactDialog } from "./components/AddContactDialog"
import { ContactsList } from "./components/ContactsList"
import type { NewContactFormData } from "./components/types"
import { useI18n } from "@/lib/i18n/context"
import { listContacts, type CRMContactItem, type CRMListMeta } from "@/src/services/crm-api"

export default function CRMPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [contacts, setContacts] = useState<CRMContactItem[]>([])
  const [meta, setMeta] = useState<CRMListMeta>({ current_page: 1, per_page: 15, total: 0 })
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { t } = useI18n()

  useEffect(() => {
    let isMounted = true
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await listContacts({ page, per_page: perPage, search: searchTerm, status: statusFilter !== "all" ? statusFilter : undefined })
        if (!isMounted) return
        setContacts(res.data)
        setMeta(res.meta)
      } catch (e: any) {
        if (!isMounted) return
        setError(e?.message || "Failed to load contacts")
        setContacts([])
        setMeta({ current_page: page, per_page: perPage, total: 0 })
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    run()
    return () => {
      isMounted = false
    }
  }, [page, perPage, searchTerm, statusFilter])

  const handleAddContact = async (form: NewContactFormData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      // TODO: Hook up to real create contact API when available

      toast({
        title: t.contactCreated,
        description: t.contactCreatedDesc,
      })

      // Refetch the list
      setPage(1)
    } catch (error) {
      toast({
        title: t.error,
        description: t.failedToCreateContact,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-4 space-y-6">
      <CRMHeader onAddContact={() => setShowAddDialog(true)} />

      <CRMFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 rounded">{error}</div>
      )}
      <ContactsList contacts={contacts} loading={loading} onAddClick={() => setShowAddDialog(true)} />

      <div className="flex items-center justify-between pt-2">
        <div className="text-sm text-muted-foreground">
          {t.page} {meta.current_page} / {Math.max(1, Math.ceil((meta.total || 0) / (meta.per_page || perPage)))}
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={loading || page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            {t.previous || "Previous"}
          </button>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={loading || page >= Math.ceil((meta.total || 0) / (meta.per_page || perPage))}
            onClick={() => setPage((p) => p + 1)}
          >
            {t.next || "Next"}
          </button>
        </div>
      </div>

      <AddContactDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddContact}
      />
    </div>
  )
}
