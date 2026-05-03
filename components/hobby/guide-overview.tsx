"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, type Variants } from "motion/react"
import {
  ArrowLeft,
  Clock,
  Layers,
  ChevronRight,
  Sparkles,
  BookOpen,
  Play,
} from "lucide-react"

import { useGuideDetail, type Technique } from "@/hooks/use-guide-detail"
import { Skeleton } from "@/components/ui/skeleton"

const STAGGER_DELAY_S = 0.08
const SLIDE_DISTANCE_PX = 24
const CARD_HOVER_Y = -6

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: STAGGER_DELAY_S },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: SLIDE_DISTANCE_PX },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

const GENRE_GRADIENTS: Record<string, string> = {
  music: "from-amber-500/20 via-orange-500/10 to-transparent",
  art: "from-rose-500/20 via-pink-500/10 to-transparent",
  sport: "from-emerald-500/20 via-green-500/10 to-transparent",
  craft: "from-violet-500/20 via-purple-500/10 to-transparent",
  cooking: "from-orange-500/20 via-amber-500/10 to-transparent",
  tech: "from-sky-500/20 via-cyan-500/10 to-transparent",
  language: "from-indigo-500/20 via-blue-500/10 to-transparent",
  fitness: "from-lime-500/20 via-green-500/10 to-transparent",
}

function getGenreGradient(genre: string): string {
  const key = genre.toLowerCase()
  for (const [k, v] of Object.entries(GENRE_GRADIENTS)) {
    if (key.includes(k)) return v
  }
  return "from-primary/20 via-primary/10 to-transparent"
}

interface TechniqueCardProps {
  technique: Technique
  guideId: string
  techniqueIndex: number
}

const TechniqueCard = React.memo(function TechniqueCard({
  technique,
  guideId,
  techniqueIndex,
}: TechniqueCardProps) {
  const sortedSubtopics = React.useMemo(
    () => [...technique.subtopics].sort((a, b) => a.sort_order - b.sort_order),
    [technique.subtopics]
  )

  return (
    <motion.div variants={itemVariants} className="group">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-bold text-primary">
          {techniqueIndex + 1}
        </span>
        <h2 className="font-heading text-xl font-bold text-foreground">
          {technique.title}
        </h2>
      </div>

      <div className="space-y-2 pl-0 sm:pl-11">
        {sortedSubtopics.map((subtopic, i) => (
          <Link
            key={subtopic.id}
            href={`/hobby/${guideId}/topic/${subtopic.id}`}
          >
            <motion.div
              whileHover={{
                y: CARD_HOVER_Y,
                transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
              }}
              className="group/card flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow duration-300 hover:shadow-md"
            >
              <div className="flex items-center gap-3.5 overflow-hidden">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-xs font-medium text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate font-heading text-sm font-semibold text-foreground">
                    {subtopic.title}
                  </h3>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {subtopic.text}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {subtopic.subtopic_videos.length > 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-primary/8 px-2 py-0.5 text-[10px] font-medium text-primary">
                    <Play className="h-2.5 w-2.5" />
                    {subtopic.subtopic_videos.length}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover/card:translate-x-1 group-hover/card:text-primary" />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  )
})

function OverviewSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 sm:px-10">
      <Skeleton className="mb-4 h-6 w-24 rounded-full" />
      <Skeleton className="mb-2 h-10 w-2/3 rounded-lg" />
      <Skeleton className="mb-8 h-5 w-1/3 rounded-lg" />
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-7 w-1/3 rounded-lg" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}

interface GuideOverviewProps {
  guideId: string
}

export default function GuideOverview({ guideId }: GuideOverviewProps) {
  const router = useRouter()
  const { guide, isLoading, error } = useGuideDetail(guideId)

  const sortedTechniques = React.useMemo(
    () =>
      guide?.techniques
        ? [...guide.techniques].sort((a, b) => a.sort_order - b.sort_order)
        : [],
    [guide?.techniques]
  )

  const totalSubtopics = React.useMemo(
    () => sortedTechniques.reduce((acc, t) => acc + t.subtopics.length, 0),
    [sortedTechniques]
  )

  const handleBack = React.useCallback(() => {
    router.push("/dashboard")
  }, [router])

  if (isLoading) return <OverviewSkeleton />

  if (error || !guide) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4">
        <p className="text-sm text-destructive">
          {error?.message ?? "Guide not found"}
        </p>
        <button
          onClick={handleBack}
          className="text-sm text-primary underline underline-offset-4"
        >
          Back to dashboard
        </button>
      </div>
    )
  }

  const genreGradient = getGenreGradient(guide.genre)

  return (
    <div className="relative min-h-svh overflow-x-hidden">
      {/* decorative background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div
          className={`absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br ${genreGradient} blur-3xl`}
        />
        <div className="absolute top-1/2 -left-48 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* header */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-4 sm:px-10">
          <motion.button
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            onClick={handleBack}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </motion.button>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="font-product text-lg text-primary"
          >
            HobiStic
          </motion.span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-20 pt-10 sm:px-10">
        {/* hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              {guide.genre}
            </span>
            {guide.is_first_time && (
              <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                <Sparkles className="h-3 w-3" />
                First time
              </span>
            )}
          </div>

          <h1 className="mb-3 font-heading text-3xl font-bold capitalize leading-tight text-foreground sm:text-4xl md:text-5xl">
            {guide.hobby}
          </h1>

          <p className="mb-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            {guide.reason_of_learning}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary/60" />
              {guide.time_per_day}h / day
            </span>
            <span className="h-4 w-px bg-border" />
            <span className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-primary/60" />
              {sortedTechniques.length} techniques
            </span>
            <span className="h-4 w-px bg-border" />
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-primary/60" />
              {totalSubtopics} topics
            </span>
          </div>
        </motion.div>

        {/* techniques list */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-10"
        >
          {sortedTechniques.map((technique, i) => (
            <TechniqueCard
              key={technique.id}
              technique={technique}
              guideId={guideId}
              techniqueIndex={i}
            />
          ))}
        </motion.div>
      </main>
    </div>
  )
}
