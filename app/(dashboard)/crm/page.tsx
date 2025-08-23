"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingCart,
  Filter,
  MoreHorizontal,
  Users,
} from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

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
}

const MOCK_CONTACTS: Contact[] = [
  {
    id: "contact-001",
    name: "Ahmed Hassan",
    company: "BuildTech Construction Ltd",
    email: "ahmed.hassan@buildtech.com",
    phone: "+971-50-123-4567",
    country: "United Arab Emirates",
    status: "active",
    lastContact: "2024-11-20T10:30:00Z",
    totalOrders: 15,
    totalRevenue: 125000,
    tags: ["construction", "steel", "high-volume"],
    notes: "Key client for steel pipes and construction materials. Prefers bulk orders with 30-day payment terms.",
  },
  {
    id: "contact-002",
    name: "Sarah Johnson",
    company: "EcoFashion International",
    email: "sarah@ecofashion.com",
    phone: "+1-555-0123",
    country: "United States",
    status: "active",
    lastContact: "2024-11-18T14:15:00Z",
    totalOrders: 8,
    totalRevenue: 68000,
    tags: ["textiles", "organic", "sustainable"],
    notes: "Focuses on sustainable and organic textiles. Regular orders for organic cotton products.",
  },
  {
    id: "contact-003",
    name: "Liu Wei",
    company: "MegaFactory Solutions",
    email: "liu.wei@megafactory.cn",
    phone: "+86-138-0013-8000",
    country: "China",
    status: "prospect",
    lastContact: "2024-11-15T09:45:00Z",
    totalOrders: 0,
    totalRevenue: 0,
    tags: ["electronics", "led", "industrial"],
    notes: "Interested in LED lighting systems for industrial applications. Potential for large volume orders.",
  },
  {
    id: "contact-004",
    name: "Maria Rodriguez",
    company: "TechnoElectronics Corp",
    email: "maria.rodriguez@technoelectronics.com",
    phone: "+34-91-123-4567",
    country: "Spain",
    status: "active",
    lastContact: "2024-11-19T16:20:00Z",
    totalOrders: 12,
    totalRevenue: 89500,
    tags: ["electronics", "components", "automotive"],
    notes: "Regular buyer of electronic components. Interested in automotive parts expansion.",
  },
  {
    id: "contact-005",
    name: "James Wilson",
    company: "Global Machinery Inc",
    email: "james.wilson@globalmachinery.com",
    phone: "+44-20-7946-0958",
    country: "United Kingdom",
    status: "active",
    lastContact: "2024-11-17T11:30:00Z",
    totalOrders: 6,
    totalRevenue: 156000,
    tags: ["machinery", "equipment", "industrial"],
    notes: "Specializes in industrial machinery. High-value orders with extended payment terms.",
  },
  {
    id: "contact-006",
    name: "Priya Sharma",
    company: "Indian Textiles Hub",
    email: "priya.sharma@indiantextiles.in",
    phone: "+91-98765-43210",
    country: "India",
    status: "prospect",
    lastContact: "2024-11-12T13:45:00Z",
    totalOrders: 2,
    totalRevenue: 15000,
    tags: ["textiles", "cotton", "wholesale"],
    notes: "New contact interested in cotton textiles. Potential for regular wholesale orders.",
  },
  {
    id: "contact-007",
    name: "Hans Mueller",
    company: "German Engineering Solutions",
    email: "hans.mueller@germaneng.de",
    phone: "+49-30-12345678",
    country: "Germany",
    status: "active",
    lastContact: "2024-11-21T08:15:00Z",
    totalOrders: 9,
    totalRevenue: 198000,
    tags: ["engineering", "precision", "automotive"],
    notes: "Requires high-precision components for automotive industry. Quality-focused buyer.",
  },
  {
    id: "contact-008",
    name: "Fatima Al-Zahra",
    company: "Gulf Trading Company",
    email: "fatima@gulftrading.ae",
    phone: "+971-4-567-8901",
    country: "United Arab Emirates",
    status: "inactive",
    lastContact: "2024-10-05T12:00:00Z",
    totalOrders: 4,
    totalRevenue: 32000,
    tags: ["trading", "general", "middle-east"],
    notes: "Previously active trader. Last contact over a month ago. May need follow-up.",
  },
  {
    id: "contact-009",
    name: "Roberto Silva",
    company: "Brazilian Imports Ltd",
    email: "roberto.silva@brazilimports.com.br",
    phone: "+55-11-9876-5432",
    country: "Brazil",
    status: "prospect",
    lastContact: "2024-11-14T15:30:00Z",
    totalOrders: 1,
    totalRevenue: 8500,
    tags: ["imports", "south-america", "machinery"],
    notes: "New prospect from South America. Interested in machinery and equipment imports.",
  },
  {
    id: "contact-010",
    name: "Yuki Tanaka",
    company: "Tokyo Electronics Co",
    email: "yuki.tanaka@tokyoelectronics.jp",
    phone: "+81-3-1234-5678",
    country: "Japan",
    status: "active",
    lastContact: "2024-11-16T10:45:00Z",
    totalOrders: 11,
    totalRevenue: 145000,
    tags: ["electronics", "precision", "technology"],
    notes: "High-tech electronics buyer. Focuses on precision components and latest technology.",
  },
]

export default function CRMPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [language] = useState<"en" | "ar">("en")

  const [newContact, setNewContact] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    country: "",
    status: "prospect",
    notes: "",
    tags: "",
  })

  const isArabic = language === "ar"

  useEffect(() => {
    fetchContacts()
  }, [searchTerm, statusFilter])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      let filteredContacts = [...MOCK_CONTACTS]

      // Apply search filter
      if (searchTerm) {
        filteredContacts = filteredContacts.filter(
          (contact) =>
            contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.country.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      }

      // Apply status filter
      if (statusFilter !== "all") {
        filteredContacts = filteredContacts.filter((contact) => contact.status === statusFilter)
      }

      setContacts(filteredContacts)
    } catch (error) {
      setContacts([])
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic ? "فشل في تحميل جهات الاتصال" : "Failed to load contacts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddContact = async () => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      const contactData = {
        id: `contact-${Date.now()}`,
        ...newContact,
        lastContact: new Date().toISOString(),
        totalOrders: 0,
        totalRevenue: 0,
        tags: newContact.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      }

      // Add to mock data
      MOCK_CONTACTS.unshift(contactData as Contact)

      toast({
        title: isArabic ? "تم إنشاء جهة الاتصال" : "Contact Created",
        description: isArabic ? "تم إنشاء جهة الاتصال بنجاح" : "Contact has been created successfully",
      })

      setShowAddDialog(false)
      setNewContact({
        name: "",
        company: "",
        email: "",
        phone: "",
        country: "",
        status: "prospect",
        notes: "",
        tags: "",
      })
      fetchContacts()
    } catch (error) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic ? "فشل في إنشاء جهة الاتصال" : "Failed to create contact",
        variant: "destructive",
      })
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isArabic ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{isArabic ? "إدارة علاقات العملاء" : "CRM"}</h1>
          <p className="text-muted-foreground">
            {isArabic ? "إدارة جهات الاتصال والعلاقات مع المشترين" : "Manage your buyer contacts and relationships"}
          </p>
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {isArabic ? "إضافة جهة اتصال" : "Add Contact"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{isArabic ? "إضافة جهة اتصال جديدة" : "Add New Contact"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{isArabic ? "الاسم" : "Name"} *</Label>
                  <Input
                    id="name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">{isArabic ? "الشركة" : "Company"} *</Label>
                  <Input
                    id="company"
                    value={newContact.company}
                    onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{isArabic ? "البريد الإلكتروني" : "Email"} *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">{isArabic ? "الهاتف" : "Phone"}</Label>
                  <Input
                    id="phone"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">{isArabic ? "البلد" : "Country"}</Label>
                  <Input
                    id="country"
                    value={newContact.country}
                    onChange={(e) => setNewContact({ ...newContact, country: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">{isArabic ? "الحالة" : "Status"}</Label>
                <Select
                  value={newContact.status}
                  onValueChange={(value) => setNewContact({ ...newContact, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospect">{isArabic ? "محتمل" : "Prospect"}</SelectItem>
                    <SelectItem value="active">{isArabic ? "نشط" : "Active"}</SelectItem>
                    <SelectItem value="inactive">{isArabic ? "غير نشط" : "Inactive"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">{isArabic ? "العلامات" : "Tags"}</Label>
                <Input
                  id="tags"
                  placeholder={isArabic ? "مفصولة بفواصل" : "Comma separated"}
                  value={newContact.tags}
                  onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{isArabic ? "ملاحظات" : "Notes"}</Label>
                <Textarea
                  id="notes"
                  value={newContact.notes}
                  onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddContact} className="flex-1">
                  {isArabic ? "إضافة جهة الاتصال" : "Add Contact"}
                </Button>
                <Button variant="outline" onClick={() => setShowAddDialog(false)} className="bg-transparent">
                  {isArabic ? "إلغاء" : "Cancel"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isArabic ? "البحث في جهات الاتصال..." : "Search contacts..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isArabic ? "جميع الحالات" : "All Status"}</SelectItem>
            <SelectItem value="active">{isArabic ? "نشط" : "Active"}</SelectItem>
            <SelectItem value="prospect">{isArabic ? "محتمل" : "Prospect"}</SelectItem>
            <SelectItem value="inactive">{isArabic ? "غير نشط" : "Inactive"}</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="bg-transparent">
          <Filter className="h-4 w-4 mr-2" />
          {isArabic ? "المزيد من المرشحات" : "More Filters"}
        </Button>
      </div>

      {/* Contacts List */}
      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {contacts && contacts.length > 0
            ? contacts.map((contact) => (
                <Card key={contact.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{contact.name}</h3>
                            <p className="text-muted-foreground">{contact.company}</p>
                          </div>
                          <Badge className={getStatusColor(contact.status)}>
                            {isArabic
                              ? contact.status === "active"
                                ? "نشط"
                                : contact.status === "prospect"
                                  ? "محتمل"
                                  : "غير نشط"
                              : contact.status}
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
                            {formatDate(contact.lastContact)}
                          </div>
                        </div>

                        <div className="flex items-center gap-6 mb-3">
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{contact.totalOrders}</span>
                            <span className="text-sm text-muted-foreground">{isArabic ? "طلبات" : "orders"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">${contact.totalRevenue.toLocaleString()}</span>
                            <span className="text-sm text-muted-foreground">{isArabic ? "إيرادات" : "revenue"}</span>
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
                            {isArabic ? "عرض" : "View"}
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            : null}

          {(!contacts || contacts.length === 0) && !loading && (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">{isArabic ? "لا توجد جهات اتصال" : "No contacts found"}</h3>
                <p className="text-muted-foreground mb-4">
                  {isArabic
                    ? "ابدأ بإضافة جهات اتصال جديدة لإدارة علاقاتك"
                    : "Start by adding new contacts to manage your relationships"}
                </p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isArabic ? "إضافة جهة اتصال" : "Add Contact"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
