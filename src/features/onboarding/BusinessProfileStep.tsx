"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, Upload, X } from "lucide-react"

type Props = {
  businessProfile: any
  setBusinessProfile: (updater: any) => void
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onLogoRemove: () => void
}

export default function BusinessProfileStep({ businessProfile, setBusinessProfile, onLogoUpload, onLogoRemove }: Props) {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Left Column */}
      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium text-gray-900">Company logo</Label>
          <div className="mt-2">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
              {(businessProfile.logo || businessProfile.existingLogoUrl) ? (
                <div className="space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-lg overflow-hidden bg-white shadow-sm">
                    <Image
                      src={
                        businessProfile.logo
                          ? URL.createObjectURL(businessProfile.logo)
                          : businessProfile.existingLogoUrl || "/placeholder.svg"
                      }
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
                      {businessProfile.logo ? "Replace" : "Change Logo"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onLogoRemove}
                    >
                      Remove
                    </Button>
                  </div>
                  {businessProfile.existingLogoUrl && !businessProfile.logo && (
                    <p className="text-xs text-gray-500">
                      Current logo from your company profile
                    </p>
                  )}
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
                onChange={onLogoUpload}
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
            onChange={(e) => setBusinessProfile((prev: any) => ({ ...prev, companyName: e.target.value }))}
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
            onChange={(e) => setBusinessProfile((prev: any) => ({ ...prev, foundedYear: e.target.value }))}
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
            onChange={(e) => setBusinessProfile((prev: any) => ({ ...prev, description: e.target.value }))}
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
                  setBusinessProfile((prev: any) => ({
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
                  setBusinessProfile((prev: any) => ({
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
                  setBusinessProfile((prev: any) => ({
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
                  setBusinessProfile((prev: any) => ({
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
                setBusinessProfile((prev: any) => ({
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
                    setBusinessProfile((prev: any) => ({
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
                    setBusinessProfile((prev: any) => ({
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
                  placeholder="e.g., supplier.secondary@company.com"
                  value={businessProfile.secondaryContact.email}
                  onChange={(e) =>
                    setBusinessProfile((prev: any) => ({
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
}

