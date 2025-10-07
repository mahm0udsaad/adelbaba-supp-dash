"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle } from "lucide-react"

type ShippingCompany = {
  id: string
  name: string
  logo: string
  description: string
}

type Props = {
  shippingCompanies: ShippingCompany[]
  selectedShipping: string[]
  setSelectedShipping: (updater: any) => void
  shippingConfig: { handlingTime: string; shipsFrom: string; incoterms: string[]; configureLater: boolean }
  setShippingConfig: (updater: any) => void
  loading?: boolean
}

export default function ShippingConfigurationStep({ shippingCompanies, selectedShipping, setSelectedShipping, shippingConfig, setShippingConfig, loading = false }: Props) {
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
            {loading && shippingCompanies.length === 0 && (
              <>
                {[0,1,2,3,4,5].map((i) => (
                  <Card key={`skeleton-${i}`} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
                          <div className="h-3 w-64 bg-gray-100 rounded animate-pulse" />
                        </div>
                        <div className="w-5 h-5 bg-gray-100 rounded-full animate-pulse" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}

            {!loading && shippingCompanies.length === 0 && (
              <div className="p-4 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg">No carriers available at the moment.</div>
            )}

            {shippingCompanies.map((company) => (
              <Card
                key={company.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                  selectedShipping.includes(company.id)
                    ? "ring-2 ring-orange-600 bg-orange-50 shadow-lg"
                    : "hover:border-orange-300"
                }`}
                onClick={() => {
                  setSelectedShipping((prev: string[]) =>
                    prev.includes(company.id) ? prev.filter((id: string) => id !== company.id) : [...prev, company.id],
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
              onValueChange={(value) => setShippingConfig((prev: any) => ({ ...prev, handlingTime: value }))}
            >
              <SelectTrigger className="mt-2 w-full">
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
              onChange={(e) => setShippingConfig((prev: any) => ({ ...prev, shipsFrom: e.target.value }))}
              className="mt-2"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <Checkbox
            id="configure-later"
            checked={shippingConfig.configureLater}
            onCheckedChange={(checked) =>
              setShippingConfig((prev: any) => ({ ...prev, configureLater: checked as boolean }))
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
}

