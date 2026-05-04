"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import {
  Clock,
  Sparkles,
  BookOpen,
  Loader2,
  ChevronRight,
} from "lucide-react"

import type { Guide } from "@/hooks/use-guides"

interface GuideCardProps {
  guide: Guide
  index: number
  totalCount: number
  onHoverStart: () => void
  onHoverEnd: () => void
}

const SLIDE_ENTER_X = -14
const ITEM_DELAY_S = 0.07
const ENTER_DURATION_S = 0.5
const TITLE_SLIDE_X = 26
const TITLE_TRANSITION = { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const }

const GENRE_COLORS: Record<string, { text: string; dot: string }> = {
  music:    { text: "text-amber-500  dark:text-amber-400",  dot: "bg-amber-400" },
  art:      { text: "text-rose-500   dark:text-rose-400",   dot: "bg-rose-400" },
  sport:    { text: "text-emerald-500 dark:text-emerald-400", dot: "bg-emerald-400" },
  craft:    { text: "text-violet-500 dark:text-violet-400", dot: "bg-violet-400" },
  cooking:  { text: "text-orange-500 dark:text-orange-400", dot: "bg-orange-400" },
  tech:     { text: "text-sky-500    dark:text-sky-400",    dot: "bg-sky-400" },
  language: { text: "text-indigo-500 dark:text-indigo-400", dot: "bg-indigo-400" },
  fitness:  { text: "text-lime-500   dark:text-lime-400",   dot: "bg-lime-400" },
}

const DEFAULT_GENRE = { text: "text-primary", dot: "bg-primary" }

function getGenreStyle(genre: string) {
  const key = genre.toLowerCase()
  for (const [k, v] of Object.entries(GENRE_COLORS)) {
    if (key.includes(k)) return v
  }
  return DEFAULT_GENRE
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function numLabel(n: number): string {
  return String(n).padStart(2, "0")
}

const GuideCard = React.memo(function GuideCard({
  guide,
  index,
  totalCount,
  onHoverStart,
  onHoverEnd,
}: GuideCardProps) {
  const [hovered, setHovered] = React.useState(false)
  const genreStyle = React.useMemo(() => getGenreStyle(guide.genre), [guide.genre])
  const isProcessing = guide.status === "processing"

  const handleMouseEnter = React.useCallback(() => {
    setHovered(true)
    onHoverStart()
  }, [onHoverStart])

  const handleMouseLeave = React.useCallback(() => {
    setHovered(false)
    onHoverEnd()
  }, [onHoverEnd])

  const inner = (
    <motion.div
      initial={{ opacity: 0, x: SLIDE_ENTER_X }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: ENTER_DURATION_S,
        delay: index * ITEM_DELAY_S,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={[
        "group relative border-b border-border/50 first:border-t",
        "py-7 sm:py-9",
        isProcessing ? "cursor-default" : "cursor-pointer",
      ].join(" ")}
    >
      {/* hover bg wash */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-sm bg-primary/[0.04] dark:bg-primary/[0.07]"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
      />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* left — index + hobby name */}
        <div className="flex flex-col gap-2 overflow-hidden">
          {/* top meta row */}
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[11px] font-semibold tracking-widest text-muted-foreground/50">
              {numLabel(index + 1)}
            </span>
            <span
              className={[
                "h-1 w-1 shrink-0 rounded-full",
                genreStyle.dot,
              ].join(" ")}
            />
            <span
              className={[
                "truncate text-[11px] font-bold uppercase tracking-[0.18em]",
                genreStyle.text,
              ].join(" ")}
            >
              {guide.genre}
            </span>

            {isProcessing && (
              <span className="ml-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-blue-500 dark:text-blue-400">
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                processing
              </span>
            )}
          </div>

          {/* hobby title */}
          <motion.h3
            animate={{ x: hovered ? TITLE_SLIDE_X : 0 }}
            transition={TITLE_TRANSITION}
            className="font-heading text-3xl font-bold capitalize leading-none tracking-tight text-foreground sm:text-4xl"
          >
            {guide.hobby}
          </motion.h3>
        </div>

        {/* right — details */}
        <div
          className={[
            "flex flex-col items-start gap-3 transition-opacity duration-500 lg:ml-auto lg:items-end",
            "opacity-100 lg:opacity-0",
            hovered ? "lg:opacity-100" : "",
          ].join(" ")}
        >
          {/* reason */}
          <p className="font-sans text-base italic leading-snug text-muted-foreground lg:text-right">
            &ldquo;{guide.reason_of_learning}&rdquo;
          </p>

          {/* pills */}
          <div className="flex flex-wrap gap-1.5 lg:justify-end">
            <span className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <Clock className="h-3 w-3" />
              {guide.time_per_day}h/day
            </span>

            {guide.subtopic_count != null && guide.subtopic_count > 0 && (
              <span className="flex items-center gap-1 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <BookOpen className="h-3 w-3" />
                {guide.subtopic_count} topics
              </span>
            )}

            {guide.is_first_time && (
              <span className="flex items-center gap-1 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                beginner
              </span>
            )}
          </div>

          <span className="text-xs uppercase tracking-widest text-muted-foreground/50 lg:text-right">
            {formatDate(guide.created_at)}
          </span>
        </div>

        {/* mobile cover image */}
        {guide.cover_image && (
          <div className="block h-44 w-full overflow-hidden rounded-xl sm:h-52 lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={guide.cover_image}
              alt={guide.hobby}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* chevron arrow */}
        {!isProcessing && (
          <motion.div
            animate={{ x: hovered ? 4 : 0, opacity: hovered ? 1 : 0.3 }}
            transition={TITLE_TRANSITION}
            className="hidden shrink-0 items-center self-center lg:flex"
          >
            <ChevronRight className="h-5 w-5 text-primary" />
          </motion.div>
        )}
      </div>
    </motion.div>
  )

  if (isProcessing) return inner

  return <Link href={`/hobby/${guide.id}`}>{inner}</Link>
})

export default GuideCard
