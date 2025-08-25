"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Plus } from "lucide-react"
import type { Contact } from "./types"
import { ContactCard } from "./ContactCard"
import { useI18n } from "@/lib/i18n/context"

export function ContactsList({
  contacts,
  loading,
  onAddClick,
}: {
  contacts: Contact[]
  loading: boolean
  onAddClick?: () => void
}) {
  const { t } = useI18n()
  if (loading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded" />
        ))}
      </div>
    )
  }

  if (!contacts || contacts.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">{t.noContactsFound}</h3>
          <p className="text-muted-foreground mb-4">
            {t.startByAddingContacts}
          </p>
          {onAddClick && (
            <Button onClick={onAddClick}>
              <Plus className="h-4 w-4 mr-2" />
              {t.addContact}
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {contacts.map((contact) => (
        <ContactCard key={contact.id} contact={contact} />
      ))}
    </div>
  )
}


