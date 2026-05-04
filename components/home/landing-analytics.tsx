"use client"

import * as React from "react"

import { useAnalytics } from "@/hooks/use-analytics"

export function LandingAnalytics() {
  const { trackEvent } = useAnalytics()
  const hasTrackedRef = React.useRef(false)

  React.useEffect(() => {
    if (hasTrackedRef.current) {
      return
    }

    hasTrackedRef.current = true
    trackEvent("LandingPageViewed")
  }, [trackEvent])

  return null
}
