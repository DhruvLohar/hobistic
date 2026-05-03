"use client"

import * as React from "react"
import { useParams } from "next/navigation"

import GuideOverview from "@/components/hobby/guide-overview"

export default function HobbyPage() {
  const params = useParams<{ id: string }>()
  return <GuideOverview guideId={params.id} />
}
