"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  Mail,
  MailOpen,
  Reply,
  Forward,
  Archive,
  Trash2,
  Star,
  Clock,
  AlertCircle,
  Paperclip,
  Send,
  ArrowLeft,
  MoreVertical,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useI18n } from "@/lib/i18n/context"
import { useMockData } from "@/lib/mock-data-context"
import { useApiWithFallback } from "@/hooks/useApiWithFallback"
import { inboxApi } from "@/src/services/inbox-api"

interface Message {
  id: string
  subject: string
  from: {
    name: string
    company: string
    email: string
    avatar: string
  }
  to: {
    name: string
    email: string
  }
  status: "unread" | "read" | "replied" | "urgent"
  priority: "high" | "medium" | "low"
  category: "inquiry" | "order" | "support" | "general"
  createdAt: string
  lastReply: string
  messages: Array<{
    id: string
    content: string
    sender: "buyer" | "supplier"
    timestamp: string
    attachments: Array<{ name: string; size: string; type: string }>
  }>
  tags: string[]
}

const MOCK_MESSAGES: Message[] = [
  {
    id: "msg-001",
    subject: "Inquiry about Steel Pipes - Bulk Order",
    from: {
      name: "Ahmed Hassan",
      company: "BuildTech Construction Ltd",
      email: "ahmed.hassan@buildtech.com",
      avatar: "/person-smiling.png",
    },
    to: {
      name: "Supplier Team",
      email: "supplier@adelbaba.com",
    },
    status: "unread",
    priority: "high",
    category: "inquiry",
    createdAt: "2024-11-21T09:30:00Z",
    lastReply: "2024-11-21T09:30:00Z",
    messages: [
      {
        id: "msg-001-1",
        content:
          "Hello,\n\nI am interested in your steel pipes for a major construction project in Dubai. We need:\n\n- Quantity: 5,000 pieces\n- Diameter: 50mm - 200mm\n- Material: Carbon Steel ASTM A53\n- Surface: Galvanized\n\nCould you please provide:\n1. Best pricing for this quantity\n2. Lead time for delivery\n3. Payment terms\n4. Technical specifications sheet\n\nWe are looking to place the order within the next two weeks.\n\nBest regards,\nAhmed Hassan",
        sender: "buyer",
        timestamp: "2024-11-21T09:30:00Z",
        attachments: [
          { name: "project_requirements.pdf", size: "2.3 MB", type: "pdf" },
          { name: "technical_drawings.dwg", size: "1.8 MB", type: "dwg" },
        ],
      },
    ],
    tags: ["steel", "construction", "bulk-order", "urgent"],
  },
  {
    id: "msg-002",
    subject: "Re: Organic Cotton T-Shirts Quote Request",
    from: {
      name: "Sarah Johnson",
      company: "EcoFashion International",
      email: "sarah@ecofashion.com",
      avatar: "/diverse-group-smiling.png",
    },
    to: {
      name: "Supplier Team",
      email: "supplier@adelbaba.com",
    },
    status: "replied",
    priority: "medium",
    category: "order",
    createdAt: "2024-11-20T14:15:00Z",
    lastReply: "2024-11-20T16:45:00Z",
    messages: [
      {
        id: "msg-002-1",
        content:
          "Hi,\n\nThank you for your quote on organic cotton t-shirts. The pricing looks competitive. I have a few follow-up questions:\n\n1. Can you provide GOTS certification documents?\n2. What are the available colors beyond the standard ones?\n3. Is it possible to get samples before placing the full order?\n4. What's your minimum order quantity for custom labels?\n\nLooking forward to your response.\n\nBest,\nSarah",
        sender: "buyer",
        timestamp: "2024-11-20T14:15:00Z",
        attachments: [],
      },
      {
        id: "msg-002-2",
        content:
          "Dear Sarah,\n\nThank you for your interest in our organic cotton t-shirts. Here are the answers to your questions:\n\n1. Yes, we have GOTS certification. I'll attach the documents.\n2. We offer 12 additional colors including earth tones and pastels.\n3. Samples are available at $15 each including shipping.\n4. Custom labels start from 500 pieces minimum.\n\nI've attached our complete color chart and certification documents. Please let me know if you need any additional information.\n\nBest regards,\nSupplier Team",
        sender: "supplier",
        timestamp: "2024-11-20T16:45:00Z",
        attachments: [
          { name: "GOTS_Certificate.pdf", size: "1.2 MB", type: "pdf" },
          { name: "Color_Chart.jpg", size: "800 KB", type: "jpg" },
        ],
      },
    ],
    tags: ["textiles", "organic", "samples"],
  },
  {
    id: "msg-003",
    subject: "LED Lighting Systems - Technical Specifications",
    from: {
      name: "Liu Wei",
      company: "MegaFactory Solutions",
      email: "liu.wei@megafactory.cn",
      avatar: "/abstract-flowing-lines.png",
    },
    to: {
      name: "Supplier Team",
      email: "supplier@adelbaba.com",
    },
    status: "urgent",
    priority: "high",
    category: "inquiry",
    createdAt: "2024-11-19T11:20:00Z",
    lastReply: "2024-11-19T11:20:00Z",
    messages: [
      {
        id: "msg-003-1",
        content:
          "Dear Supplier,\n\nWe are urgently looking for LED lighting systems for our new factory installation. Requirements:\n\n- Power: 150W - 200W\n- IP Rating: IP65 minimum\n- Color Temperature: 5000K - 6500K\n- Quantity: 2,000 units\n- Delivery: Within 30 days\n\nThis is time-sensitive as our factory opening is scheduled for next month. Please provide immediate quotation with technical specifications.\n\nRegards,\nLiu Wei\nProcurement Manager",
        sender: "buyer",
        timestamp: "2024-11-19T11:20:00Z",
        attachments: [{ name: "factory_layout.pdf", size: "3.1 MB", type: "pdf" }],
      },
    ],
    tags: ["led", "industrial", "urgent", "factory"],
  },
  {
    id: "msg-004",
    subject: "Order Confirmation - Electronic Components",
    from: {
      name: "Maria Rodriguez",
      company: "TechnoElectronics Corp",
      email: "maria.rodriguez@technoelectronics.com",
      avatar: "/portrait-thoughtful-woman.png",
    },
    to: {
      name: "Supplier Team",
      email: "supplier@adelbaba.com",
    },
    status: "read",
    priority: "medium",
    category: "order",
    createdAt: "2024-11-18T13:45:00Z",
    lastReply: "2024-11-18T15:30:00Z",
    messages: [
      {
        id: "msg-004-1",
        content:
          "Hello,\n\nI would like to confirm our order for electronic components:\n\n- Order ID: ORD-2024-1118\n- Total Value: $45,000\n- Payment Terms: 30% advance, 70% before shipment\n- Delivery Address: Madrid, Spain\n\nPlease confirm the order details and provide the proforma invoice.\n\nThanks,\nMaria Rodriguez",
        sender: "buyer",
        timestamp: "2024-11-18T13:45:00Z",
        attachments: [],
      },
      {
        id: "msg-004-2",
        content:
          "Dear Maria,\n\nThank you for your order confirmation. We have processed your order ORD-2024-1118.\n\nOrder Details Confirmed:\n- Total Value: $45,000\n- Payment Terms: Accepted\n- Estimated Delivery: 15-20 business days\n- Shipping Method: DHL Express\n\nProforma invoice is attached. Please arrange the advance payment to proceed with production.\n\nBest regards,\nSupplier Team",
        sender: "supplier",
        timestamp: "2024-11-18T15:30:00Z",
        attachments: [{ name: "Proforma_Invoice_ORD-2024-1118.pdf", size: "450 KB", type: "pdf" }],
      },
    ],
    tags: ["electronics", "order", "confirmed"],
  },
  {
    id: "msg-005",
    subject: "Quality Issue - Previous Shipment",
    from: {
      name: "James Wilson",
      company: "Global Machinery Inc",
      email: "james.wilson@globalmachinery.com",
      avatar: "/portrait-thoughtful-man.png",
    },
    to: {
      name: "Supplier Team",
      email: "supplier@adelbaba.com",
    },
    status: "unread",
    priority: "high",
    category: "support",
    createdAt: "2024-11-17T16:30:00Z",
    lastReply: "2024-11-17T16:30:00Z",
    messages: [
      {
        id: "msg-005-1",
        content:
          "Dear Team,\n\nI need to report a quality issue with our recent shipment (Order #ORD-2024-1015).\n\nIssue Details:\n- 15 units out of 100 have surface defects\n- Packaging was damaged during transit\n- Some components are missing from the accessory kit\n\nWe need immediate resolution as this is affecting our production schedule. Please advise on the next steps for replacement or refund.\n\nAttached are photos of the defective items.\n\nUrgent response needed.\n\nJames Wilson\nQuality Manager",
        sender: "buyer",
        timestamp: "2024-11-17T16:30:00Z",
        attachments: [
          { name: "defect_photos.zip", size: "5.2 MB", type: "zip" },
          { name: "quality_report.pdf", size: "1.1 MB", type: "pdf" },
        ],
      },
    ],
    tags: ["quality", "support", "urgent", "defect"],
  },
  {
    id: "msg-006",
    subject: "New Product Inquiry - Automotive Parts",
    from: {
      name: "Hans Mueller",
      company: "German Engineering Solutions",
      email: "hans.mueller@germaneng.de",
      avatar: "/hans-portrait.png",
    },
    to: {
      name: "Supplier Team",
      email: "supplier@adelbaba.com",
    },
    status: "read",
    priority: "low",
    category: "inquiry",
    createdAt: "2024-11-16T10:15:00Z",
    lastReply: "2024-11-16T10:15:00Z",
    messages: [
      {
        id: "msg-006-1",
        content:
          "Guten Tag,\n\nWe are exploring new suppliers for precision automotive parts. Our requirements:\n\n- Material: High-grade aluminum alloy\n- Tolerance: ±0.05mm\n- Quantity: 10,000 pieces annually\n- Certification: ISO/TS 16949 required\n\nCould you please send us your capabilities brochure and quality certifications?\n\nWe are planning to visit potential suppliers next month for facility audits.\n\nMit freundlichen Grüßen,\nHans Mueller\nSenior Procurement Engineer",
        sender: "buyer",
        timestamp: "2024-11-16T10:15:00Z",
        attachments: [],
      },
    ],
    tags: ["automotive", "precision", "certification"],
  },
]

export default function InboxPage() {
  const { t, isArabic } = useI18n()
  const { messages: allMessages, setMessages: setAllMessages } = useMockData()
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [chatLoading, setChatLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [replyText, setReplyText] = useState("")
  const [language] = useState<"en" | "ar">("en")

  // Map API thread summary to UI message card model
  const mapSummaryToUiMessage = useCallback((s: any): Message => {
    const status = ["unread", "read", "replied", "urgent"].includes(String(s?.status))
      ? (s.status as Message["status"]) : "read"
    const priority = ["high", "medium", "low"].includes(String(s?.priority))
      ? (s.priority as Message["priority"]) : "medium"
    const category = ["inquiry", "order", "support", "general"].includes(String(s?.category))
      ? (s.category as Message["category"]) : "general"
    const created = s?.created_at || new Date().toISOString()
    const last = s?.last_reply_at || created
    return {
      id: String(s?.id ?? "" + Math.random()),
      subject: s?.subject || t?.inquiry || "Conversation",
      from: {
        name: s?.from_name || "Buyer",
        company: s?.from_company || "",
        email: s?.from_email || "",
        avatar: s?.avatar_url || "/placeholder.svg",
      },
      to: {
        name: "Supplier Team",
        email: "supplier@adelbaba.com",
      },
      status,
      priority,
      category,
      createdAt: created,
      lastReply: last,
      messages: [],
      tags: Array.isArray(s?.tags) ? (s.tags as string[]) : [],
    }
  }, [t])

  const fetchThreads = useCallback(async (): Promise<Message[]> => {
    const rows = await inboxApi.list({ per_page: 50 })
    return (rows || []).map(mapSummaryToUiMessage)
  }, [mapSummaryToUiMessage])

  // If API fails or returns empty, show empty state rather than mocks to avoid invalid IDs hitting API
  const fallbackThreads = useCallback(async (): Promise<Message[]> => {
    return []
  }, [])

  const { data: apiThreads, loading, setData: setApiThreads } = useApiWithFallback<Message[]>({
    fetcher: fetchThreads,
    fallback: fallbackThreads,
    deps: [],
  })

  const filtered = useMemo(() => {
    const base = (apiThreads as Message[] | undefined) ?? (allMessages as Message[])
    let filteredMessages = [...base]
    if (searchTerm) {
      filteredMessages = filteredMessages.filter(
        (message) =>
          message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.from.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.from.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }
    if (statusFilter !== "all") {
      filteredMessages = filteredMessages.filter((message) => message.status === statusFilter)
    }
    if (categoryFilter !== "all") {
      filteredMessages = filteredMessages.filter((message) => message.category === categoryFilter)
    }
    return filteredMessages
  }, [apiThreads, allMessages, searchTerm, statusFilter, categoryFilter])

  // keep local state for selection/grid mapping
  useEffect(() => {
    setMessages(filtered)
  }, [filtered])

  // When a thread is opened, fetch its messages and mark as read
  useEffect(() => {
    if (!selectedMessage) return
    const idStr = String(selectedMessage.id)
    const isApiThread = /^\d+$/.test(idStr)
    if (!isApiThread) {
      // Skip API calls for mock/local threads
      return
    }
    let cancelled = false
    setChatLoading(true)
    ;(async () => {
      try {
        const apiMsgs = await inboxApi.getMessages(selectedMessage.id)
        if (cancelled) return
        const mapped = (apiMsgs || []).map((m: any) => ({
          id: String(m.id),
          content: String(m.content || ""),
          sender: (m.sender === "supplier" ? "supplier" : "buyer") as const,
          timestamp: String(m.timestamp || new Date().toISOString()),
          attachments: Array.isArray(m.attachments) ? m.attachments : [],
        }))
        setSelectedMessage((prev) =>
          prev && prev.id === selectedMessage.id
            ? { ...prev, messages: mapped, status: "read", lastReply: mapped[mapped.length - 1]?.timestamp || prev.lastReply }
            : prev,
        )
        // Update list view status to read
        setMessages((prev) => prev.map((m) => (m.id === selectedMessage.id ? { ...m, status: "read" } : m)))
        // Best-effort mark read
        try { await inboxApi.markRead(selectedMessage.id) } catch {}
      } finally {
        if (!cancelled) setChatLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [selectedMessage?.id])

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return

    try {
      const newReply = {
        id: `reply-${Date.now()}`,
        content: replyText,
        sender: "supplier" as const,
        timestamp: new Date().toISOString(),
        attachments: [],
      }

      const updatedMessage = {
        ...selectedMessage,
        status: "replied" as const,
        lastReply: new Date().toISOString(),
        messages: [...selectedMessage.messages, newReply],
      }

      // Optimistically update local stores
      setAllMessages((prev) => (prev as Message[]).map((msg) => (msg.id === selectedMessage.id ? updatedMessage : msg)))
      setMessages((prev) => prev.map((msg) => (msg.id === selectedMessage.id ? { ...msg, status: "replied" } : msg)))
      setSelectedMessage(updatedMessage)

      // Send to API only for real threads (numeric IDs). For mock threads, keep optimistic update only.
      const idStr = String(selectedMessage.id)
      if (/^\d+$/.test(idStr)) {
        await inboxApi.sendMessage(selectedMessage.id, { type: "text", content: replyText })
      }

      toast({
        title: t.replySent,
        description: t.replySentDesc,
      })

      setReplyText("")
    } catch (error) {
      toast({
        title: t.error,
        description: t.failedToSendReply,
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unread":
        return "bg-blue-100 text-blue-800"
      case "replied":
        return "bg-green-100 text-green-800"
      case "urgent":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "medium":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isArabic ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(isArabic ? "ar-SA" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // If a message is selected, show full-screen chat
  if (selectedMessage) {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Chat Header */}
        <div className="p-4 border-b bg-card flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedMessage(null)}
              className="p-2 hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedMessage.from.avatar || "/placeholder.svg"} />
              <AvatarFallback>{selectedMessage.from.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-lg">{selectedMessage.from.name}</h2>
              <p className="text-sm text-muted-foreground truncate">{selectedMessage.from.company}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(selectedMessage.status)} text-xs`} variant="secondary">
              {selectedMessage.status}
            </Badge>
            <Button variant="ghost" size="sm" className="p-2">
              <Star className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Archive className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>


        {/* Chat Messages - Full Height */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-muted/20">
          <div className="max-w-4xl mx-auto p-6 space-y-8">
            {selectedMessage.messages.map((msg, index) => (
              <div key={msg.id} className={`flex gap-4 ${msg.sender === "supplier" ? "flex-row-reverse" : ""}`}>
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarImage
                    src={
                      msg.sender === "buyer"
                        ? selectedMessage.from.avatar
                        : "/placeholder.svg?height=48&width=48&query=supplier"
                    }
                  />
                  <AvatarFallback className="text-lg">
                    {msg.sender === "buyer" ? selectedMessage.from.name.charAt(0) : "S"}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`flex-1 max-w-[70%] ${msg.sender === "supplier" ? "text-right" : ""}`}>
                  <div className={`flex items-center gap-3 mb-3 ${msg.sender === "supplier" ? "justify-end" : ""}`}>
                    <span className="font-semibold text-sm">
                      {msg.sender === "buyer" ? selectedMessage.from.name : "Supplier Team"}
                    </span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  
                  <div className={`rounded-3xl px-6 py-4 shadow-sm ${
                    msg.sender === "supplier" 
                      ? "bg-primary text-primary-foreground ml-auto" 
                      : "bg-card border"
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    
                    {msg.attachments.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border/20 space-y-2">
                        <p className="text-xs font-medium opacity-75">
                          {t.attachments}:
                        </p>
                        {msg.attachments.map((attachment) => (
                          <div 
                            key={attachment.name} 
                            className="flex items-center gap-3 p-3 rounded-xl bg-background/20 hover:bg-background/30 cursor-pointer transition-all group"
                          >
                            <div className="h-8 w-8 rounded-lg bg-background/30 flex items-center justify-center">
                              <Paperclip className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{attachment.name}</p>
                              <p className="text-xs opacity-60">{attachment.size}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reply Section - Minimized */}
        <div className="border-t bg-card shadow-lg p-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <Textarea
                placeholder={t.writeReply}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={3}
                className="resize-none pr-24 text-base border-2 focus:border-primary"
              />
              
              {/* Action Buttons Inside Input */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-muted"
                  title={t.attachFile}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <Button 
                  onClick={handleSendReply} 
                  disabled={!replyText.trim()} 
                  size="sm"
                  className="h-8 px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Additional Actions - Compact */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Reply className="h-3 w-3" />
                {isArabic ? "رد على" : "Reply to"} {selectedMessage.from.name}
              </span>
              
              <Button variant="ghost" size="sm" className="text-xs h-6">
                <Forward className="h-3 w-3 mr-1" />
                {isArabic ? "إعادة توجيه" : "Forward"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default view - Message List
  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.inboxHeader}</h1>
          <p className="text-muted-foreground">{t.manageInbox}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.searchMessages}
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
            <SelectItem value="all">{t.allStatuses}</SelectItem>
            <SelectItem value="unread">{t.unread}</SelectItem>
            <SelectItem value="replied">{t.replied}</SelectItem>
            <SelectItem value="urgent">{t.urgent}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.allCategories}</SelectItem>
            <SelectItem value="inquiry">{t.inquiry}</SelectItem>
            <SelectItem value="order">{t.orderLower}</SelectItem>
            <SelectItem value="support">{t.support}</SelectItem>
            <SelectItem value="general">{t.general}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Messages Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="h-48 animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-20 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : messages.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-12 text-center">
                <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">{isArabic ? "لا توجد رسائل" : "No messages found"}</h3>
                <p className="text-muted-foreground">
                  {isArabic ? "لا توجد رسائل تطابق المعايير المحددة" : "No messages match the selected criteria"}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          messages.map((message) => (
            <Card
              key={message.id}
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-l-4 border-l-transparent hover:border-l-primary"
              onClick={() => setSelectedMessage(message)}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {message.status === "unread" ? (
                        <Mail className="h-4 w-4 text-blue-500" />
                      ) : (
                        <MailOpen className="h-4 w-4 text-muted-foreground" />
                      )}
                      {getPriorityIcon(message.priority)}
                      {message.status === "unread" && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                    </div>
                    <Badge className={`${getStatusColor(message.status)} text-xs`} variant="secondary">
                      {isArabic
                        ? message.status === "unread"
                          ? "جديد"
                          : message.status === "replied"
                            ? "رد"
                            : message.status === "urgent"
                              ? "عاجل"
                              : message.status
                        : message.status}
                    </Badge>
                  </div>

                  {/* Contact Info */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={message.from.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-sm font-medium">
                        {message.from.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{message.from.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{message.from.company}</p>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <h4 className="font-medium text-sm line-clamp-2 leading-tight mb-2">
                      {message.subject}
                    </h4>
                    {message.messages && message.messages[0]?.content ? (
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {message.messages[0]?.content.substring(0, 120)}...
                      </p>
                    ) : null}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(message.lastReply).split(',')[0]}
                    </span>
                    <div className="flex items-center gap-1">
                      {message.messages.length > 1 && (
                        <Badge variant="outline" className="text-xs px-2 py-0">
                          {message.messages.length} msgs
                        </Badge>
                      )}
                      {message.messages.some(msg => msg.attachments.length > 0) && (
                        <Paperclip className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {message.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {message.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs px-2 py-0">
                          {tag}
                        </Badge>
                      ))}
                      {message.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs px-2 py-0">
                          +{message.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
