"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { useI18n } from "@/lib/i18n/context"
import type { Notification } from "@/src/services/notifications-api"
import { notificationsApi } from "@/src/services/notifications-api"

interface NotificationsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function humanizeType(type: string): string {
  return type
    .split(/[.\-_]/g)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ")
}

function extractTitle(notification: Notification): string {
  const { data, type } = notification

  const candidates = [
    data?.title,
    data?.subject,
    data?.heading,
    typeof data?.status === "string" ? data.status : undefined,
    type,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate === type ? humanizeType(candidate) : candidate
    }
  }

  return humanizeType(type)
}

function extractMessage(notification: Notification): string | undefined {
  const { data } = notification

  const candidates = [
    data?.message,
    data?.body,
    data?.description,
    data?.summary,
    data?.content,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate
    }
  }

  if (data && typeof data === "object") {
    const fallback = Object.values(data).find((value) => typeof value === "string")
    if (typeof fallback === "string") {
      return fallback
    }
  }

  return undefined
}

function formatTimestamp(timestamp: string | null | undefined, locale: string): string {
  if (!timestamp) return ""
  const parsed = new Date(timestamp)
  if (Number.isNaN(parsed.valueOf())) {
    return timestamp
  }
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed)
}

export function NotificationsSheet({ open, onOpenChange }: NotificationsSheetProps) {
  const { t, language, isArabic } = useI18n()
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [error, setError] = useState<string | null>(null)
  const [hasFetched, setHasFetched] = useState(false)

  const locale = useMemo(() => (language === "ar" ? "ar-EG" : "en-US"), [language])

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await notificationsApi.list()
      setNotifications(response?.data ?? [])
      setHasFetched(true)
    } catch (err) {
      console.error("Failed to load notifications", err)
      setError(t.failedToLoadNotifications)
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (!open) return
    fetchNotifications()
  }, [open, fetchNotifications])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={isArabic ? "left" : "right"} className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t.notifications}</SheetTitle>
          <SheetDescription>{t.notificationsSheetSubtitle}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((index) => (
                <Skeleton key={index} className="h-20 w-full" />
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTitle>{t.failedToLoadNotifications}</AlertTitle>
              <AlertDescription className="flex flex-col gap-3">
                <span>{error}</span>
                <Button size="sm" variant="outline" onClick={fetchNotifications}>
                  {t.retry}
                </Button>
              </AlertDescription>
            </Alert>
          ) : notifications.length === 0 && hasFetched ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-md border border-dashed p-6 text-center">
              <div className="text-sm font-medium">{t.notificationsEmptyState}</div>
              <p className="mt-1 text-xs text-muted-foreground">{t.notificationsEmptyStateSubtitle}</p>
            </div>
          ) : (
            <ScrollArea className="h-full pr-2">
              <div className="space-y-3 pr-2">
                {notifications.map((notification) => {
                  const title = extractTitle(notification)
                  const message = extractMessage(notification)
                  const timestamp = formatTimestamp(notification.created_at, locale)

                  return (
                    <div
                      key={notification.id}
                      className="rounded-lg border bg-card p-4 shadow-sm transition hover:border-primary/50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">{title}</p>
                          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
                        </div>
                        {!notification.read_at ? <Badge variant="secondary">{t.unread}</Badge> : null}
                      </div>
                      {timestamp ? (
                        <p className="mt-3 text-xs text-muted-foreground">{timestamp}</p>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}


