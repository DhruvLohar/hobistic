"use client"

import * as React from "react"

import type { AppEventType } from "@/src/utils/analytics-events"

type EventData = Record<string, unknown>

export function useAnalytics() {
  const trackEvent = React.useCallback((event: AppEventType, data?: EventData) => {
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        data: data ?? {},
      }),
    }).catch((error) => {
      console.error("[analytics] Failed to track event:", error)
    })
  }, [])

  return { trackEvent }
}
