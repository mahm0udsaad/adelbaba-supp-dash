"use client"

import { useMemo, useState } from "react"
import { AdsHeader } from "./components/AdsHeader"
import { StatusFilter } from "./components/StatusFilter"
import { CreateAdDialog } from "./components/CreateAdDialog"
import { AdsList } from "./components/AdsList"
import type { Ad } from "./components/types"
import { useI18n } from "@/lib/i18n/context"
import { useMockData } from "@/lib/mock-data-context"

export default function AdsPage() {
  const { ads: allAds, setAds } = useMockData()
  const [loading] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [createOpen, setCreateOpen] = useState(false)
  const { isArabic } = useI18n()

  const ads = useMemo(() => {
    const src = allAds as Ad[]
    return statusFilter === "all" ? src : src.filter((ad) => ad.status === statusFilter)
  }, [allAds, statusFilter])

  const handleCreate = (ad: Ad) => {
    setAds((prev) => [ad, ...((prev as Ad[]) || [])])
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <AdsHeader />
        <CreateAdDialog onCreate={handleCreate} open={createOpen} onOpenChange={setCreateOpen} />
      </div>

      <StatusFilter value={statusFilter} onChange={setStatusFilter} />

      <AdsList ads={ads} loading={loading} isArabic={isArabic} onCreateClick={() => setCreateOpen(true)}
      />
    </div>
  )
}
