"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  CheckCircle,
  Building,
  Truck,
  FileText,
  Package,
  Upload,
  X,
  Plus,
  Camera,
  Trash2,
  Eye,
  Download,
} from "lucide-react"
import Image from "next/image"

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  required: boolean
}

interface ShippingCompany {
  id: string
  name: string
  logo: string
  description: string
}

interface Certificate {
  id: string
  name: string
  type: string
  issuedAt: string
  expiresAt: string
  files: File[]
}

interface CompletionStatus {
  business_profile: boolean
  factory_images: boolean
  certificates: boolean
  shipping_configuration: boolean
  first_product: boolean
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus>({
    business_profile: false,
    factory_images: false,
    certificates: false,
    shipping_configuration: false,
    first_product: false,
  })

  const [businessProfile, setBusinessProfile] = useState({
    logo: null as File | null,
    companyName: "",
    foundedYear: "",
    description: "",
    primaryContact: {
      fullName: "",
      phone: "",
      email: "",
      isPrimary: true,
    },
    secondaryContact: {
      phone: "",
      email: "",
      show: false,
    },
  })

  const [factoryImages, setFactoryImages] = useState<File[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [selectedShipping, setSelectedShipping] = useState<string[]>([])
  const [shippingConfig, setShippingConfig] = useState({
    handlingTime: "",
    shipsFrom: "",
    incoterms: [] as string[],
    configureLater: false,
  })

  const shippingCompanies: ShippingCompany[] = [
    {
      id: "aramex",
      name: "Aramex",
      logo: "/images/aramex-logo.png",
      description: "Fast and reliable international shipping",
    },
    {
      id: "fedex",
      name: "FedEx",
      logo: "/images/fedex-logo.png",
      description: "Express delivery worldwide",
    },
    {
      id: "dhl",
      name: "DHL",
      logo: "/images/dhl-logo.png",
      description: "Global express and logistics",
    },
  ]

  const steps: OnboardingStep[] = [
    {
      id: "business_profile",
      title: "Business Profile",
      description: "Add your logo and primary contact so buyers can reach you.",
      icon: <Building className="h-6 w-6" />,
      required: true,
    },
    {
      id: "factory_images",
      title: "Factory Images",
      description: "Give buyers confidence with authentic production photos.",
      icon: <Camera className="h-6 w-6" />,
      required: false,
    },
    {
      id: "certificates",
      title: "Certificates",
      description: "Upload compliance and quality documents.",
      icon: <FileText className="h-6 w-6" />,
      required: false,
    },
    {
      id: "shipping_configuration",
      title: "Shipping Configuration",
      description: "Configure your shipping preferences and partners.",
      icon: <Truck className="h-6 w-6" />,
      required: false,
    },
    {
      id: "first_product",
      title: "First Product",
      description: "Add your first product to start selling.",
      icon: <Package className="h-6 w-6" />,
      required: true,
    },
  ]

  const completedSteps = Object.values(completionStatus).filter(Boolean).length
  const totalSteps = steps.length
  const progressPercentage = (completedSteps / totalSteps) * 100

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && (file.type === "image/png" || file.type === "image/jpeg") && file.size <= 2 * 1024 * 1024) {
      setBusinessProfile((prev) => ({ ...prev, logo: file }))
    }
  }

  const handleFactoryImagesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files
      .filter((file) => file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024)
      .slice(0, 10)
    setFactoryImages((prev) => [...prev, ...validFiles].slice(0, 10))
  }

  const removeFactoryImage = (index: number) => {
    setFactoryImages((prev) => prev.filter((_, i) => i !== index))
  }

  const addCertificate = (certificate: Omit<Certificate, "id">) => {
    const newCert = { ...certificate, id: Date.now().toString() }
    setCertificates((prev) => [...prev, newCert])
  }

  const removeCertificate = (id: string) => {
    setCertificates((prev) => prev.filter((cert) => cert.id !== id))
  }

  const handleStepCompletion = (stepId: string) => {
    setCompletionStatus((prev) => ({ ...prev, [stepId]: true }))

    // Move to next incomplete step
    const nextIncomplete = steps.findIndex(
      (step, index) => index > currentStep && !completionStatus[step.id as keyof CompletionStatus],
    )

    if (nextIncomplete !== -1) {
      setCurrentStep(nextIncomplete)
    }
  }

  const canCompleteStep = (stepId: string) => {
    switch (stepId) {
      case "business_profile":
        return (
          businessProfile.companyName.length >= 2 &&
          businessProfile.primaryContact.fullName &&
          businessProfile.primaryContact.phone &&
          businessProfile.primaryContact.email
        )
      case "shipping_configuration":
        return shippingConfig.configureLater || (selectedShipping.length > 0 && shippingConfig.handlingTime)
      default:
        return true
    }
  }

  const renderStepContent = () => {
    const step = steps[currentStep]

    switch (step.id) {
      case "business_profile":
        return (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium text-gray-900">Company logo</Label>
                <div className="mt-2">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                    {businessProfile.logo ? (
                      <div className="space-y-4">
                        <div className="w-20 h-20 mx-auto rounded-lg overflow-hidden bg-white shadow-sm">
                          <Image
                            src={URL.createObjectURL(businessProfile.logo) || "/placeholder.svg"}
                            alt="Company logo"
                            width={80}
                            height={80}
                            className="object-contain"
                          />
                        </div>
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => document.getElementById("logo-upload")?.click()}
                          >
                            Replace
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setBusinessProfile((prev) => ({ ...prev, logo: null }))}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 mx-auto text-gray-400" />
                        <div>
                          <Button onClick={() => document.getElementById("logo-upload")?.click()}>Upload Logo</Button>
                          <p className="text-sm text-gray-500 mt-2">PNG/JPG, ≤ 2 MB</p>
                        </div>
                      </div>
                    )}
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="company-name" className="text-base font-medium text-gray-900">
                  Company name
                </Label>
                <Input
                  id="company-name"
                  placeholder="e.g., Adelbaba Manufacturing Co."
                  value={businessProfile.companyName}
                  onChange={(e) => setBusinessProfile((prev) => ({ ...prev, companyName: e.target.value }))}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">2–120 characters</p>
              </div>

              <div>
                <Label htmlFor="founded-year" className="text-base font-medium text-gray-900">
                  Founded year (optional)
                </Label>
                <Input
                  id="founded-year"
                  type="number"
                  placeholder="e.g., 2015"
                  value={businessProfile.foundedYear}
                  onChange={(e) => setBusinessProfile((prev) => ({ ...prev, foundedYear: e.target.value }))}
                  className="mt-2"
                  min="1900"
                  max={new Date().getFullYear()}
                />
                <p className="text-sm text-gray-500 mt-1">1900 to current year</p>
              </div>

              <div>
                <Label htmlFor="description" className="text-base font-medium text-gray-900">
                  Company description (optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you make"
                  value={businessProfile.description}
                  onChange={(e) => setBusinessProfile((prev) => ({ ...prev, description: e.target.value }))}
                  className="mt-2"
                  maxLength={500}
                />
                <p className="text-sm text-gray-500 mt-1">Max 500 characters</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary contact</h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="full-name" className="text-base font-medium text-gray-900">
                      Full name
                    </Label>
                    <Input
                      id="full-name"
                      placeholder="e.g., Fatma Ali"
                      value={businessProfile.primaryContact.fullName}
                      onChange={(e) =>
                        setBusinessProfile((prev) => ({
                          ...prev,
                          primaryContact: { ...prev.primaryContact, fullName: e.target.value },
                        }))
                      }
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-base font-medium text-gray-900">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      placeholder="e.g., +20 10 1234 5678"
                      value={businessProfile.primaryContact.phone}
                      onChange={(e) =>
                        setBusinessProfile((prev) => ({
                          ...prev,
                          primaryContact: { ...prev.primaryContact, phone: e.target.value },
                        }))
                      }
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-1">Digits, +, spaces and dashes are allowed</p>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-base font-medium text-gray-900">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g., supplier@company.com"
                      value={businessProfile.primaryContact.email}
                      onChange={(e) =>
                        setBusinessProfile((prev) => ({
                          ...prev,
                          primaryContact: { ...prev.primaryContact, email: e.target.value },
                        }))
                      }
                      className="mt-2"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="make-primary"
                      checked={businessProfile.primaryContact.isPrimary}
                      onCheckedChange={(checked) =>
                        setBusinessProfile((prev) => ({
                          ...prev,
                          primaryContact: { ...prev.primaryContact, isPrimary: checked },
                        }))
                      }
                    />
                    <Label htmlFor="make-primary" className="text-sm font-medium text-gray-900">
                      Make primary
                    </Label>
                  </div>
                </div>
              </div>

              {/* Secondary Contact */}
              <div>
                {!businessProfile.secondaryContact.show ? (
                  <Button
                    variant="outline"
                    onClick={() =>
                      setBusinessProfile((prev) => ({
                        ...prev,
                        secondaryContact: { ...prev.secondaryContact, show: true },
                      }))
                    }
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add secondary contact
                  </Button>
                ) : (
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-900">Secondary contact</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setBusinessProfile((prev) => ({
                            ...prev,
                            secondaryContact: { phone: "", email: "", show: false },
                          }))
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div>
                      <Label htmlFor="secondary-phone" className="text-sm font-medium text-gray-900">
                        Phone
                      </Label>
                      <Input
                        id="secondary-phone"
                        placeholder="e.g., +20 10 1234 5678"
                        value={businessProfile.secondaryContact.phone}
                        onChange={(e) =>
                          setBusinessProfile((prev) => ({
                            ...prev,
                            secondaryContact: { ...prev.secondaryContact, phone: e.target.value },
                          }))
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="secondary-email" className="text-sm font-medium text-gray-900">
                        Email
                      </Label>
                      <Input
                        id="secondary-email"
                        type="email"
                        placeholder="e.g., contact@company.com"
                        value={businessProfile.secondaryContact.email}
                        onChange={(e) =>
                          setBusinessProfile((prev) => ({
                            ...prev,
                            secondaryContact: { ...prev.secondaryContact, email: e.target.value },
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case "factory_images":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Factory Images</h3>
              <p className="text-gray-600">Upload authentic production photos to build buyer confidence</p>
            </div>

            {factoryImages.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-orange-400 transition-colors">
                <Camera className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No images yet</h4>
                <p className="text-gray-600 mb-4">Add images to showcase your factory and production capabilities</p>
                <Button onClick={() => document.getElementById("factory-upload")?.click()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Images
                </Button>
                <input
                  id="factory-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFactoryImagesUpload}
                  className="hidden"
                />
                <p className="text-sm text-gray-500 mt-4">JPEG/PNG/WebP, ≤ 10 MB each, up to 10 images</p>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-600">{factoryImages.length} of 10 images uploaded</p>
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("factory-upload")?.click()}
                    disabled={factoryImages.length >= 10}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add More
                  </Button>
                  <input
                    id="factory-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFactoryImagesUpload}
                    className="hidden"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {factoryImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={URL.createObjectURL(file) || "/placeholder.svg"}
                          alt={`Factory image ${index + 1}`}
                          width={200}
                          height={200}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeFactoryImage(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {file.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case "certificates":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Certificates</h3>
              <p className="text-gray-600">Upload compliance and quality documents</p>
            </div>

            {certificates.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-orange-400 transition-colors">
                <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h4>
                <p className="text-gray-600 mb-4">Add certificates to build trust with buyers</p>
                <Button
                  onClick={() => {
                    /* Open certificate modal */
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Certificate
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">{certificates.length} certificates uploaded</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      /* Open certificate modal */
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Certificate
                  </Button>
                </div>

                <div className="space-y-3">
                  {certificates.map((cert) => (
                    <Card key={cert.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{cert.name}</h4>
                          <p className="text-sm text-gray-600">{cert.type}</p>
                          <div className="flex gap-4 text-xs text-gray-500 mt-1">
                            <span>Issued: {cert.issuedAt}</span>
                            <span>Expires: {cert.expiresAt}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => removeCertificate(cert.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case "shipping_configuration":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Shipping Configuration</h3>
              <p className="text-gray-600">Configure your shipping preferences and partners</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium text-gray-900">Preferred shipping partners (optional)</Label>
                <div className="grid gap-3 mt-3">
                  {shippingCompanies.map((company) => (
                    <Card
                      key={company.id}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                        selectedShipping.includes(company.id)
                          ? "ring-2 ring-orange-600 bg-orange-50 shadow-lg"
                          : "hover:border-orange-300"
                      }`}
                      onClick={() => {
                        setSelectedShipping((prev) =>
                          prev.includes(company.id) ? prev.filter((id) => id !== company.id) : [...prev, company.id],
                        )
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white shadow-sm">
                            <Image
                              src={company.logo || "/placeholder.svg"}
                              alt={`${company.name} logo`}
                              fill
                              className="object-contain p-1"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{company.name}</h4>
                            <p className="text-sm text-gray-600">{company.description}</p>
                          </div>
                          <div
                            className={`transition-all duration-300 ${
                              selectedShipping.includes(company.id) ? "scale-100 opacity-100" : "scale-0 opacity-0"
                            }`}
                          >
                            <CheckCircle className="h-5 w-5 text-orange-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="handling-time" className="text-base font-medium text-gray-900">
                    Handling time
                  </Label>
                  <Select
                    value={shippingConfig.handlingTime}
                    onValueChange={(value) => setShippingConfig((prev) => ({ ...prev, handlingTime: value }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select handling time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-3">1–3 days</SelectItem>
                      <SelectItem value="3-7">3–7 days</SelectItem>
                      <SelectItem value="7+">More than 7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ships-from" className="text-base font-medium text-gray-900">
                    Ships from
                  </Label>
                  <Input
                    id="ships-from"
                    placeholder="Country/City"
                    value={shippingConfig.shipsFrom}
                    onChange={(e) => setShippingConfig((prev) => ({ ...prev, shipsFrom: e.target.value }))}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <Checkbox
                  id="configure-later"
                  checked={shippingConfig.configureLater}
                  onCheckedChange={(checked) =>
                    setShippingConfig((prev) => ({ ...prev, configureLater: checked as boolean }))
                  }
                />
                <Label htmlFor="configure-later" className="text-sm font-medium text-gray-900">
                  I will configure shipping settings later
                </Label>
              </div>

              {shippingConfig.configureLater && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ You can complete onboarding now and configure shipping settings from your dashboard later.
                  </p>
                </div>
              )}
            </div>
          </div>
        )

      case "first_product":
        return (
          <div className="text-center space-y-6">
            <div>
              <Package className="h-16 w-16 mx-auto text-orange-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Add Your First Product</h3>
              <p className="text-gray-600 mb-6">Add a clear title, images, and minimum order to start selling</p>
            </div>

            <div className="max-w-md mx-auto">
              <Button size="lg" className="w-full bg-orange-600 hover:bg-orange-700">
                <Plus className="h-5 w-5 mr-2" />
                Add Product
              </Button>
              <p className="text-sm text-gray-500 mt-3">This will take you to the product creation page</p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-amber-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-1000">
          <h1 className="text-4xl font-bold mb-3 text-gray-900">Welcome to Your Supplier Portal</h1>
          <p className="text-gray-600 text-lg mb-8">Let's get you set up in just a few steps</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 bg-white border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-gray-900">Onboarding Progress</CardTitle>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progress</span>
                    <span className="font-medium text-gray-900">{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2 [&>div]:bg-orange-600" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {steps.map((step, index) => {
                  const isCompleted = completionStatus[step.id as keyof CompletionStatus]
                  const isCurrent = index === currentStep
                  const isAccessible = index <= currentStep || isCompleted

                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                        isCurrent ? "bg-orange-50 border border-orange-200" : ""
                      } ${isAccessible ? "hover:bg-gray-50" : "opacity-50"}`}
                      onClick={() => isAccessible && setCurrentStep(index)}
                    >
                      <div
                        className={`transition-all duration-300 ${
                          isCompleted ? "animate-pulse" : isCurrent ? "animate-bounce" : ""
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <div
                            className={`p-1 rounded-full ${
                              isCurrent ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {step.icon}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{step.title}</p>
                        {isCompleted && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 mt-1">
                            Complete
                          </Badge>
                        )}
                        {isCurrent && !isCompleted && (
                          <Badge className="text-xs bg-orange-600 hover:bg-orange-700 mt-1">Current</Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="bg-white border-gray-200 animate-in fade-in-0 slide-in-from-bottom-6 duration-700">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <div className="text-orange-600">{steps[currentStep]?.icon}</div>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-gray-900">{steps[currentStep]?.title}</CardTitle>
                    <CardDescription className="text-base mt-1 text-gray-600">
                      {steps[currentStep]?.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {renderStepContent()}

                {/* Action Buttons */}
                <div className="flex gap-4 justify-between pt-6 border-t">
                  <div>
                    {currentStep > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(currentStep - 1)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Back
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-3">
                    {!steps[currentStep].required &&
                      !completionStatus[steps[currentStep].id as keyof CompletionStatus] && (
                        <Button
                          variant="ghost"
                          onClick={() => {
                            const nextStep = currentStep + 1
                            if (nextStep < steps.length) {
                              setCurrentStep(nextStep)
                            }
                          }}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Skip for now
                        </Button>
                      )}

                    <Button
                      onClick={() => handleStepCompletion(steps[currentStep].id)}
                      disabled={!canCompleteStep(steps[currentStep].id)}
                      className="px-8 bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      Save & Continue
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
