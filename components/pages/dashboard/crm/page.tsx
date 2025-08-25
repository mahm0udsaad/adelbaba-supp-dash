"use client"

import { useMemo, useState } from "react"
import { toast } from "@/hooks/use-toast"
import { CRMHeader } from "./components/CRMHeader"
import { CRMFilters } from "./components/CRMFilters"
import { AddContactDialog } from "./components/AddContactDialog"
import { ContactsList } from "./components/ContactsList"
import type { Contact, NewContactFormData } from "./components/types"
import { useI18n } from "@/lib/i18n/context"
import { useMockData } from "@/lib/mock-data-context"

export default function CRMPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const { t } = useI18n()
  const { contacts: allContacts, setContacts: setAllContacts } = useMockData()
  const loading = false

  const contacts = useMemo(() => {
    let filtered = [...(allContacts as Contact[])]
    if (searchTerm) {
      filtered = filtered.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.country.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((contact) => contact.status === statusFilter)
    }
    return filtered
  }, [allContacts, searchTerm, statusFilter])

  const handleAddContact = async (form: NewContactFormData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const contactData: Contact = {
        id: `contact-${Date.now()}`,
        name: form.name,
        company: form.company,
        email: form.email,
        phone: form.phone,
        country: form.country,
        status: form.status,
        lastContact: new Date().toISOString(),
        totalOrders: 0,
        totalRevenue: 0,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        notes: form.notes,
      }

      setAllContacts((prev) => [contactData, ...(prev as Contact[])])

      toast({
        title: t.contactCreated,
        description: t.contactCreatedDesc,
      })

      // No refetch needed; state already updated
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

      <ContactsList contacts={contacts} loading={loading} onAddClick={() => setShowAddDialog(true)} />

      <AddContactDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddContact}
      />
    </div>
  )
}
