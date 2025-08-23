"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Shield, ExternalLink, Download, AlertTriangle, CheckCircle, FileText, Award } from "lucide-react"
import apiClient from "@/lib/axios"
import { toast } from "@/hooks/use-toast"

interface Certificate {
  id: string
  name: string
  type: "quality" | "compliance" | "environmental"
  issuer: string
  issueDate: string
  expiryDate: string
  status: "active" | "expiring_soon" | "expired"
  certificateNumber: string
  scope: string
  documentUrl: string
  verificationUrl: string
  applicableProducts: string[]
  description: string
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [language] = useState<"en" | "ar">("en")

  const [newCertificate, setNewCertificate] = useState({
    name: "",
    type: "quality",
    issuer: "",
    issueDate: "",
    expiryDate: "",
    certificateNumber: "",
    scope: "",
    verificationUrl: "",
    applicableProducts: "",
    description: "",
  })

  const isArabic = language === "ar"

  const mockCertificates: Certificate[] = [
    {
      id: "cert-1",
      name: "ISO 9001:2015 Quality Management",
      type: "quality",
      issuer: "SGS International",
      issueDate: "2023-01-15",
      expiryDate: "2026-01-15",
      status: "active",
      certificateNumber: "SGS-QMS-2023-001",
      scope: "Design, manufacture and supply of electronic components and assemblies",
      documentUrl: "/certificates/iso9001.pdf",
      verificationUrl: "https://sgs.com/verify/SGS-QMS-2023-001",
      applicableProducts: ["Electronic Components", "PCB Assemblies", "Sensors"],
      description:
        "International standard for quality management systems, demonstrating our commitment to consistent quality and customer satisfaction.",
    },
    {
      id: "cert-2",
      name: "CE Marking Compliance",
      type: "compliance",
      issuer: "TÜV Rheinland",
      issueDate: "2023-06-10",
      expiryDate: "2025-06-10",
      status: "expiring_soon",
      certificateNumber: "TUV-CE-2023-456",
      scope: "Electronic devices for European market compliance",
      documentUrl: "/certificates/ce-marking.pdf",
      verificationUrl: "https://tuv.com/verify/TUV-CE-2023-456",
      applicableProducts: ["Smart Devices", "IoT Sensors", "Control Systems"],
      description:
        "European conformity marking indicating compliance with health, safety, and environmental protection standards.",
    },
    {
      id: "cert-3",
      name: "ISO 14001:2015 Environmental Management",
      type: "environmental",
      issuer: "Bureau Veritas",
      issueDate: "2022-09-20",
      expiryDate: "2025-09-20",
      status: "active",
      certificateNumber: "BV-EMS-2022-789",
      scope: "Environmental management system for manufacturing operations",
      documentUrl: "/certificates/iso14001.pdf",
      verificationUrl: "https://bureauveritas.com/verify/BV-EMS-2022-789",
      applicableProducts: ["All Manufacturing Products"],
      description:
        "International standard for environmental management systems, demonstrating our commitment to environmental responsibility.",
    },
    {
      id: "cert-4",
      name: "RoHS Compliance Certificate",
      type: "compliance",
      issuer: "Intertek",
      issueDate: "2023-03-15",
      expiryDate: "2024-03-15",
      status: "expired",
      certificateNumber: "ITK-ROHS-2023-321",
      scope: "Restriction of Hazardous Substances in electrical equipment",
      documentUrl: "/certificates/rohs.pdf",
      verificationUrl: "https://intertek.com/verify/ITK-ROHS-2023-321",
      applicableProducts: ["Electronic Components", "Circuit Boards"],
      description:
        "Compliance with EU directive restricting hazardous substances in electrical and electronic equipment.",
    },
    {
      id: "cert-5",
      name: "OHSAS 18001 Occupational Health & Safety",
      type: "compliance",
      issuer: "DNV GL",
      issueDate: "2023-08-01",
      expiryDate: "2026-08-01",
      status: "active",
      certificateNumber: "DNV-OHS-2023-654",
      scope: "Occupational health and safety management system",
      documentUrl: "/certificates/ohsas18001.pdf",
      verificationUrl: "https://dnv.com/verify/DNV-OHS-2023-654",
      applicableProducts: ["All Products"],
      description:
        "International standard for occupational health and safety management systems, ensuring workplace safety.",
    },
  ]

  useEffect(() => {
    fetchCertificates()
  }, [typeFilter, statusFilter])

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get("/v1/supplier/certificates", {
        params: { type: typeFilter, status: statusFilter },
      })

      if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        setCertificates(response.data.data)
      } else {
        let filteredCertificates = mockCertificates

        if (typeFilter !== "all") {
          filteredCertificates = filteredCertificates.filter((cert) => cert.type === typeFilter)
        }

        if (statusFilter !== "all") {
          filteredCertificates = filteredCertificates.filter((cert) => cert.status === statusFilter)
        }

        setCertificates(filteredCertificates)
      }
    } catch (error) {
      console.log("[v0] API failed, using mock certificates data")
      let filteredCertificates = mockCertificates

      if (typeFilter !== "all") {
        filteredCertificates = filteredCertificates.filter((cert) => cert.type === typeFilter)
      }

      if (statusFilter !== "all") {
        filteredCertificates = filteredCertificates.filter((cert) => cert.status === statusFilter)
      }

      setCertificates(filteredCertificates)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCertificate = async () => {
    try {
      const certificateData = {
        ...newCertificate,
        applicableProducts: newCertificate.applicableProducts
          .split(",")
          .map((product) => product.trim())
          .filter(Boolean),
      }

      await apiClient.post("/v1/supplier/certificates", certificateData)

      toast({
        title: isArabic ? "تم إضافة الشهادة" : "Certificate Added",
        description: isArabic ? "تم إضافة الشهادة بنجاح" : "Certificate has been added successfully",
      })

      setShowAddDialog(false)
      setNewCertificate({
        name: "",
        type: "quality",
        issuer: "",
        issueDate: "",
        expiryDate: "",
        certificateNumber: "",
        scope: "",
        verificationUrl: "",
        applicableProducts: "",
        description: "",
      })
      fetchCertificates()
    } catch (error) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic ? "فشل في إضافة الشهادة" : "Failed to add certificate",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "expiring_soon":
        return "bg-yellow-100 text-yellow-800"
      case "expired":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "quality":
        return <Award className="h-4 w-4" />
      case "compliance":
        return <Shield className="h-4 w-4" />
      case "environmental":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
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
          <h1 className="text-2xl font-bold text-foreground">{isArabic ? "إدارة الشهادات" : "Certificates"}</h1>
          <p className="text-muted-foreground">
            {isArabic ? "إدارة شهادات الجودة والامتثال" : "Manage your quality and compliance certificates"}
          </p>
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {isArabic ? "إضافة شهادة" : "Add Certificate"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isArabic ? "إضافة شهادة جديدة" : "Add New Certificate"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{isArabic ? "اسم الشهادة" : "Certificate Name"} *</Label>
                <Input
                  id="name"
                  value={newCertificate.name}
                  onChange={(e) => setNewCertificate({ ...newCertificate, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">{isArabic ? "النوع" : "Type"} *</Label>
                <Select
                  value={newCertificate.type}
                  onValueChange={(value) => setNewCertificate({ ...newCertificate, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quality">{isArabic ? "جودة" : "Quality"}</SelectItem>
                    <SelectItem value="compliance">{isArabic ? "امتثال" : "Compliance"}</SelectItem>
                    <SelectItem value="environmental">{isArabic ? "بيئي" : "Environmental"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issuer">{isArabic ? "الجهة المصدرة" : "Issuer"} *</Label>
                <Input
                  id="issuer"
                  value={newCertificate.issuer}
                  onChange={(e) => setNewCertificate({ ...newCertificate, issuer: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">{isArabic ? "تاريخ الإصدار" : "Issue Date"} *</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={newCertificate.issueDate}
                    onChange={(e) => setNewCertificate({ ...newCertificate, issueDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">{isArabic ? "تاريخ الانتهاء" : "Expiry Date"} *</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={newCertificate.expiryDate}
                    onChange={(e) => setNewCertificate({ ...newCertificate, expiryDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="certificateNumber">{isArabic ? "رقم الشهادة" : "Certificate Number"} *</Label>
                <Input
                  id="certificateNumber"
                  value={newCertificate.certificateNumber}
                  onChange={(e) => setNewCertificate({ ...newCertificate, certificateNumber: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope">{isArabic ? "النطاق" : "Scope"} *</Label>
                <Textarea
                  id="scope"
                  value={newCertificate.scope}
                  onChange={(e) => setNewCertificate({ ...newCertificate, scope: e.target.value })}
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="verificationUrl">{isArabic ? "رابط التحقق" : "Verification URL"}</Label>
                <Input
                  id="verificationUrl"
                  type="url"
                  value={newCertificate.verificationUrl}
                  onChange={(e) => setNewCertificate({ ...newCertificate, verificationUrl: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicableProducts">{isArabic ? "المنتجات المطبقة" : "Applicable Products"}</Label>
                <Input
                  id="applicableProducts"
                  placeholder={isArabic ? "مفصولة بفواصل" : "Comma separated"}
                  value={newCertificate.applicableProducts}
                  onChange={(e) => setNewCertificate({ ...newCertificate, applicableProducts: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{isArabic ? "الوصف" : "Description"}</Label>
                <Textarea
                  id="description"
                  value={newCertificate.description}
                  onChange={(e) => setNewCertificate({ ...newCertificate, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddCertificate} className="flex-1">
                  {isArabic ? "إضافة الشهادة" : "Add Certificate"}
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
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isArabic ? "جميع الأنواع" : "All Types"}</SelectItem>
            <SelectItem value="quality">{isArabic ? "جودة" : "Quality"}</SelectItem>
            <SelectItem value="compliance">{isArabic ? "امتثال" : "Compliance"}</SelectItem>
            <SelectItem value="environmental">{isArabic ? "بيئي" : "Environmental"}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isArabic ? "جميع الحالات" : "All Status"}</SelectItem>
            <SelectItem value="active">{isArabic ? "نشط" : "Active"}</SelectItem>
            <SelectItem value="expiring_soon">{isArabic ? "ينتهي قريباً" : "Expiring Soon"}</SelectItem>
            <SelectItem value="expired">{isArabic ? "منتهي" : "Expired"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Certificates List */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.isArray(certificates) &&
            certificates.map((certificate) => (
              <Card key={certificate.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 text-primary rounded-lg">{getTypeIcon(certificate.type)}</div>
                      <div>
                        <CardTitle className="text-lg">{certificate.name}</CardTitle>
                        <p className="text-muted-foreground">{certificate.issuer}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(certificate.status)}>
                      {certificate.status === "expiring_soon" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {isArabic
                        ? certificate.status === "active"
                          ? "نشط"
                          : certificate.status === "expiring_soon"
                            ? "ينتهي قريباً"
                            : "منتهي"
                        : certificate.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{certificate.description}</p>
                  </div>

                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isArabic ? "رقم الشهادة" : "Certificate Number"}:</span>
                      <span className="font-medium">{certificate.certificateNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isArabic ? "تاريخ الإصدار" : "Issue Date"}:</span>
                      <span>{formatDate(certificate.issueDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isArabic ? "تاريخ الانتهاء" : "Expiry Date"}:</span>
                      <span>{formatDate(certificate.expiryDate)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">{isArabic ? "النطاق" : "Scope"}:</p>
                    <p className="text-sm text-muted-foreground">{certificate.scope}</p>
                  </div>

                  {certificate.applicableProducts.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{isArabic ? "المنتجات المطبقة" : "Applicable Products"}:</p>
                      <div className="flex flex-wrap gap-1">
                        {certificate.applicableProducts.map((product) => (
                          <Badge key={product} variant="secondary" className="text-xs">
                            {product}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      {isArabic ? "تحميل" : "Download"}
                    </Button>
                    {certificate.verificationUrl && (
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {isArabic ? "تحقق" : "Verify"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

          {(!Array.isArray(certificates) || certificates.length === 0) && !loading && (
            <div className="col-span-2">
              <Card>
                <CardContent className="p-12 text-center">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">{isArabic ? "لا توجد شهادات" : "No certificates found"}</h3>
                  <p className="text-muted-foreground mb-4">
                    {isArabic
                      ? "ابدأ بإضافة شهادات الجودة والامتثال"
                      : "Start by adding your quality and compliance certificates"}
                  </p>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {isArabic ? "إضافة شهادة" : "Add Certificate"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
