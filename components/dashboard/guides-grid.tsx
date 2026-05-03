"use client"

import * as React from "react"
import { motion } from "motion/react"
import { BookOpen } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { useGuides } from "@/hooks/use-guides"
import GuideCard from "./guide-card"

function GuidesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4 rounded-2xl border border-border p-5">
          <Skeleton className="h-4 w-1/3 rounded-full" />
          <Skeleton className="h-6 w-2/3 rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-4 w-1/2 rounded-full" />
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <BookOpen className="h-6 w-6 text-primary" />
      </div>
      <p className="font-heading text-base font-semibold text-foreground">No guides yet</p>
      <p className="max-w-xs text-sm text-muted-foreground">
        Fill in the form above and hit Go to generate your first personalized hobby guide.
      </p>
    </motion.div>
  )
}

export default function GuidesGrid() {
  const { guides, isLoading, error } = useGuides()

  if (isLoading) return <GuidesSkeleton />

  if (error) {
    return (
      <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {error.message}
      </p>
    )
  }

  if (!guides.length) return <EmptyState />

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {guides.map((guide, i) => (
        <GuideCard key={guide.id} guide={guide} index={i} />
      ))}
    </div>
  )
}
