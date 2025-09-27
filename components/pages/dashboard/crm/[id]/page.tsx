"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingCart,
  Edit,
  Save,
  X,
  MessageSquare,
  Video,
  Users,
} from "lucide-react"

import type { CRMContactDetail } from "@/src/services/crm-api"
import { crmApi } from "@/src/services/crm-api"

// Remove local mock; details now fetched via API

export default function ContactDetailPage() {
  const params = useParams()
  const router = useRouter()
  const contactId = params.id as string

  const [contact, setContact] = useState<CRMContactDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedNotes, setEditedNotes] = useState("")

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const data = await crmApi.getContact(contactId)
        setContact(data)
        setEditedNotes(Array.isArray(data.notes) ? data.notes.join("\n") : (data as any).notes || "")
      } catch (error) {
        setContact(null)
      } finally {
        setLoading(false)
      }
    }

    fetchContact()
  }, [contactId])

  const handleSaveNotes = async () => {
    if (!contact) return

    try {
      // TODO: Wire to API when endpoint for updating notes is available
      setContact({ ...contact, notes: [editedNotes] } as CRMContactDetail)
      setIsEditing(false)
    } catch (error) {
      setContact({ ...contact, notes: [editedNotes] } as CRMContactDetail)
      setIsEditing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "prospect":
        return "bg-blue-100 text-blue-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />
      case "call":
        return <Phone className="h-4 w-4" />
      case "meeting":
        return <Video className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading contact details...</p>
        </div>
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Contact not found</p>
          <Button onClick={() => router.push("/dashboard/crm")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to CRM
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/crm")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to CRM
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{contact.customer.name}</h1>
            <p className="text-muted-foreground">{contact.customer.has_company && contact.customer.company_name ? contact.customer.company_name : ""}</p>
          </div>
        </div>
        {/* No discrete status in API; could infer from activity if needed */}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact Information */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{contact.customer.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{contact.customer.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Country</p>
                  <p className="text-sm text-muted-foreground">{contact.customer.has_company && contact.customer.company_name ? contact.customer.company_name : ""}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Contact</p>
                  <p className="text-sm text-muted-foreground">{new Date(contact.updated_at || contact.created_at || new Date().toISOString()).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Business Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total Orders</span>
                </div>
                <span className="text-lg font-bold">{contact.placed_orders}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Paid Orders</span>
                </div>
                <span className="text-lg font-bold">{contact.paid_orders}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total Revenue</span>
                </div>
                <span className="text-lg font-bold">${Number(contact.total_spent).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg. Order Value</span>
                <span className="text-lg font-bold">${Number(contact.avg_order_value).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">RFQs</span>
                <span className="text-lg font-bold">{contact.rfqs_count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Quotes Received</span>
                <span className="text-lg font-bold">{contact.quotes_received}</span>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {contact.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Notes</CardTitle>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false)
                        setEditedNotes(contact.notes)
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveNotes}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  placeholder="Add notes about this contact..."
                  className="min-h-[100px]"
                />
              ) : (
                <p className="text-sm text-muted-foreground">{(Array.isArray(contact.notes) ? contact.notes.join("\n") : (contact as any).notes) || "No notes available"}</p>
              )}
            </CardContent>
          </Card>

          {/* Interaction History */}
          <Card>
            <CardHeader>
              <CardTitle>Interaction History</CardTitle>
              <CardDescription>Recent communications and meetings with this contact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(contact.interactions || []).map((interaction) => (
                  <div key={interaction.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getInteractionIcon(interaction.interaction_type)}
                        <h4 className="font-medium">{interaction.title}</h4>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {interaction.interaction_type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(interaction.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
