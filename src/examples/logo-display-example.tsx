/**
 * Example component demonstrating logo display and change functionality
 * This shows how the logo system works with existing company data
 */

"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"
import Image from "next/image"

interface LogoDisplayExampleProps {
  existingLogoUrl?: string
  onLogoChange?: (file: File | null) => void
  onLogoRemove?: () => void
}

export function LogoDisplayExample({ 
  existingLogoUrl = "", 
  onLogoChange, 
  onLogoRemove 
}: LogoDisplayExampleProps) {
  const [logo, setLogo] = useState<File | null>(null)
  const [existingLogo, setExistingLogo] = useState(existingLogoUrl)

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && (file.type === "image/png" || file.type === "image/jpeg") && file.size <= 2 * 1024 * 1024) {
      setLogo(file)
      setExistingLogo("") // Clear existing logo when new file is uploaded
      onLogoChange?.(file)
    }
  }

  const handleLogoRemove = () => {
    setLogo(null)
    setExistingLogo("")
    onLogoChange?.(null)
    onLogoRemove?.()
  }

  const hasLogo = logo || existingLogo

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium text-gray-900">Company Logo Example</Label>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
        {hasLogo ? (
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto rounded-lg overflow-hidden bg-white shadow-sm">
              <Image
                src={
                  logo 
                    ? URL.createObjectURL(logo) 
                    : existingLogo || "/placeholder.svg"
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
                onClick={() => document.getElementById("logo-upload-example")?.click()}
              >
                {logo ? "Replace" : "Change Logo"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleLogoRemove}
              >
                Remove
              </Button>
            </div>
            
            {existingLogo && !logo && (
              <p className="text-xs text-gray-500">
                Current logo from your company profile
              </p>
            )}
            
            {logo && (
              <p className="text-xs text-green-600">
                New logo ready to upload
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="h-12 w-12 mx-auto text-gray-400" />
            <div>
              <Button onClick={() => document.getElementById("logo-upload-example")?.click()}>
                Upload Logo
              </Button>
              <p className="text-sm text-gray-500 mt-2">PNG/JPG, ≤ 2 MB</p>
            </div>
          </div>
        )}
        
        <input
          id="logo-upload-example"
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleLogoUpload}
          className="hidden"
        />
      </div>

      {/* Debug Information */}
      <div className="bg-gray-100 p-4 rounded text-sm">
        <h4 className="font-semibold mb-2">Debug Info:</h4>
        <p><strong>Has Logo:</strong> {hasLogo ? "Yes" : "No"}</p>
        <p><strong>New File:</strong> {logo ? logo.name : "None"}</p>
        <p><strong>Existing URL:</strong> {existingLogo || "None"}</p>
        <p><strong>Display Source:</strong> {
          logo 
            ? `New file: ${logo.name}` 
            : existingLogo 
              ? `Existing: ${existingLogo}` 
              : "None"
        }</p>
      </div>
    </div>
  )
}

export default LogoDisplayExample
