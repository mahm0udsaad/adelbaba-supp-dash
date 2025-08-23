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

interface Contact {
  id: string
  name: string
  company: string
  email: string
  phone: string
  country: string
  status: "active" | "prospect" | "inactive"
  lastContact: string
  totalOrders: number
  totalRevenue: number
  tags: string[]
  notes: string
  interactions: Array<{
    id: string
    type: "email" | "call" | "meeting"
    subject: string
    date: string
    summary: string
  }>
}

const mockContactData: Record<string, Contact> = {
  "1": {
    id: "1",
    name: "Sarah Johnson",
    company: "TechCorp Solutions",
    email: "sarah.johnson@techcorp.com",
    phone: "+1-555-0123",
    country: "USA",
    status: "active",
    lastContact: "2024-08-20T10:30:00Z",
    totalOrders: 23,
    totalRevenue: 45600,
    tags: ["VIP", "Electronics"],
    notes:
      "Key decision maker for electronics procurement. Prefers bulk orders with extended payment terms. Has been a loyal customer for over 2 years.",
    interactions: [
      {
        id: "1",
        type: "email",
        subject: "New Product Inquiry - Wireless Charging Solutions",
        date: "2024-08-20T10:30:00Z",
        summary:
          "Inquired about wireless charging solutions for office setup. Interested in bulk pricing for 500+ units.",
      },
      {
        id: "2",
        type: "call",
        subject: "Order Follow-up #ORD-2024-156",
        date: "2024-08-18T14:15:00Z",
        summary:
          "Discussed delivery timeline for pending order. Confirmed shipping address and requested expedited delivery.",
      },
      {
        id: "3",
        type: "meeting",
        subject: "Q3 Business Planning Session",
        date: "2024-08-15T11:00:00Z",
        summary:
          "Virtual meeting to discuss Q3 procurement needs. Identified opportunities for new product categories.",
      },
      {
        id: "4",
        type: "email",
        subject: "Payment Terms Negotiation",
        date: "2024-08-12T16:20:00Z",
        summary:
          "Requested extended payment terms for large orders. Agreed on 45-day payment terms for orders over $10k.",
      },
    ],
  },
  "2": {
    id: "2",
    name: "Michael Chen",
    company: "Global Electronics Ltd",
    email: "m.chen@globalelectronics.co.uk",
    phone: "+44-20-7123-4567",
    country: "UK",
    status: "active",
    lastContact: "2024-08-19T16:45:00Z",
    totalOrders: 18,
    totalRevenue: 38200,
    tags: ["Regular", "Bulk Orders"],
    notes:
      "Reliable customer with consistent monthly orders. Interested in sustainable packaging options and eco-friendly products.",
    interactions: [
      {
        id: "5",
        type: "meeting",
        subject: "Quarterly Business Review",
        date: "2024-08-19T16:45:00Z",
        summary: "Reviewed Q2 performance and discussed expansion opportunities. Positive feedback on product quality.",
      },
      {
        id: "6",
        type: "email",
        subject: "Sustainable Packaging Initiative",
        date: "2024-08-16T09:30:00Z",
        summary:
          "Discussed eco-friendly packaging options. Interested in biodegradable packaging for all future orders.",
      },
    ],
  },
  "3": {
    id: "3",
    name: "Emma Rodriguez",
    company: "Innovation Hub",
    email: "emma.r@innovationhub.de",
    phone: "+49-30-12345678",
    country: "Germany",
    status: "prospect",
    lastContact: "2024-08-21T09:20:00Z",
    totalOrders: 15,
    totalRevenue: 29800,
    tags: ["New", "High Potential"],
    notes: "Startup accelerator looking for tech accessories for their portfolio companies. High growth potential.",
    interactions: [
      {
        id: "7",
        type: "email",
        subject: "Partnership Opportunity Discussion",
        date: "2024-08-21T09:20:00Z",
        summary:
          "Discussed potential partnership for supplying tech accessories to startups in their accelerator program.",
      },
    ],
  },
}

export default function ContactDetailPage() {
  const params = useParams()
  const router = useRouter()
  const contactId = params.id as string

  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedNotes, setEditedNotes] = useState("")

  useEffect(() => {
    const fetchContact = async () => {
      try {
        // Try to fetch from API first
        const response = await fetch(`/api/v1/supplier/crm/contacts/${contactId}`)
        if (response.ok) {
          const data = await response.json()
          setContact(data.data)
          setEditedNotes(data.data.notes)
        } else {
          throw new Error("API failed")
        }
      } catch (error) {
        const mockContact = mockContactData[contactId]
        if (mockContact) {
          setContact(mockContact)
          setEditedNotes(mockContact.notes)
        } else {
          setContact(null)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchContact()
  }, [contactId])

  const handleSaveNotes = async () => {
    if (!contact) return

    try {
      const response = await fetch(`/api/v1/supplier/crm/contacts/${contactId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...contact, notes: editedNotes }),
      })

      if (response.ok) {
        setContact({ ...contact, notes: editedNotes })
        setIsEditing(false)
      }
    } catch (error) {
      setContact({ ...contact, notes: editedNotes })
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
            <h1 className="text-2xl font-bold">{contact.name}</h1>
            <p className="text-muted-foreground">{contact.company}</p>
          </div>
        </div>
        <Badge className={getStatusColor(contact.status)}>
          {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
        </Badge>
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
                  <p className="text-sm text-muted-foreground">{contact.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{contact.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Country</p>
                  <p className="text-sm text-muted-foreground">{contact.country}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Contact</p>
                  <p className="text-sm text-muted-foreground">{new Date(contact.lastContact).toLocaleDateString()}</p>
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
                <span className="text-lg font-bold">{contact.totalOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total Revenue</span>
                </div>
                <span className="text-lg font-bold">${contact.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg. Order Value</span>
                <span className="text-lg font-bold">
                  ${Math.round(contact.totalRevenue / contact.totalOrders).toLocaleString()}
                </span>
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
                <p className="text-sm text-muted-foreground">{contact.notes || "No notes available"}</p>
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
                {contact.interactions.map((interaction) => (
                  <div key={interaction.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getInteractionIcon(interaction.type)}
                        <h4 className="font-medium">{interaction.subject}</h4>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {interaction.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{interaction.summary}</p>
                    <p className="text-xs text-muted-foreground">{new Date(interaction.date).toLocaleString()}</p>
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
