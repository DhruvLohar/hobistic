"use client"

import * as React from "react"
import { useParams } from "next/navigation"

import TopicView from "@/components/hobby/topic-view"

export default function TopicPage() {
  const params = useParams<{ id: string; topicId: string }>()
  return <TopicView guideId={params.id} topicId={params.topicId} />
}
