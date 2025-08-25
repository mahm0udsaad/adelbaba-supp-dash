"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin, Calendar, ShoppingCart, DollarSign, MoreHorizontal } from "lucide-react"
import type { Contact } from "./types"
import { getStatusColor, formatDate } from "./types"
import { useI18n } from "@/lib/i18n/context"

export function ContactCard({ contact }: { contact: Contact }) {
  const { t, isArabic } = useI18n()
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div>
                <h3 className="font-semibold text-lg">{contact.name}</h3>
                <p className="text-muted-foreground">{contact.company}</p>
              </div>
              <Badge className={getStatusColor(contact.status)}>
                {contact.status === "active" ? t.active : contact.status === "prospect" ? t.prospect : t.inactive}
              </Badge>
            </div>

            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {contact.email}
              </div>
              {contact.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {contact.phone}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {contact.country}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {formatDate(contact.lastContact, isArabic)}
              </div>
            </div>

            <div className="flex items-center gap-6 mb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{contact.totalOrders}</span>
                <span className="text-sm text-muted-foreground">{t.ordersLower}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">${contact.totalRevenue.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">{t.revenue}</span>
              </div>
            </div>

            {contact.tags && contact.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {contact.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Link href={`/dashboard/crm/${contact.id}`}>
              <Button variant="outline" size="sm" className="bg-transparent">
                {t.view}
              </Button>
            </Link>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


