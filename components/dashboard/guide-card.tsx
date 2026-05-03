"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { Clock, Sparkles, BookOpen, Loader2 } from "lucide-react"

import type { Guide } from "@/hooks/use-guides"

interface GuideCardProps {
  guide: Guide
  index: number
}

const GENRE_COLORS: Record<string, string> = {
  music: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  art: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  sport: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  craft: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  cooking: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  tech: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
  language: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  fitness: "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300",
}

function getGenreColor(genre: string): string {
  const key = genre.toLowerCase()
  for (const [k, v] of Object.entries(GENRE_COLORS)) {
    if (key.includes(k)) return v
  }
  return "bg-primary/10 text-primary"
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const GuideCard = React.memo(function GuideCard({ guide, index }: GuideCardProps) {
  const genreColor = React.useMemo(() => getGenreColor(guide.genre), [guide.genre])
  const isProcessing = guide.status === "processing"

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={isProcessing ? undefined : { y: -4, transition: { duration: 0.2 } }}
      className={[
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow duration-200",
        isProcessing ? "cursor-default" : "cursor-pointer hover:shadow-md",
      ].join(" ")}
    >
      {/* top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/40" />

      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <h3 className="font-heading text-lg font-semibold capitalize leading-snug text-foreground">
              {guide.hobby}
            </h3>
            <span
              className={[
                "w-fit rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                genreColor,
              ].join(" ")}
            >
              {guide.genre}
            </span>
          </div>

          <div className="flex flex-col items-end gap-1">
            {isProcessing && (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
                <Loader2 className="h-3 w-3 animate-spin" />
                processing
              </span>
            )}

            {guide.is_first_time && (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                <Sparkles className="h-3 w-3" />
                beginner
              </span>
            )}
          </div>
        </div>

        {/* reason */}
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {guide.reason_of_learning}
        </p>

        {/* footer */}
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {guide.time_per_day}h / day
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            {formatDate(guide.created_at)}
          </span>
        </div>
      </div>
    </motion.div>
  )

  if (isProcessing) return cardContent

  return <Link href={`/hobby/${guide.id}`}>{cardContent}</Link>
})

export default GuideCard
