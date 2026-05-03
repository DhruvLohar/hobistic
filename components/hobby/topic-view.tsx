"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, useScroll, useSpring, type Variants } from "motion/react"
import { ArrowLeft, Play, ExternalLink } from "lucide-react"

import { useGuideDetail, type Subtopic } from "@/hooks/use-guide-detail"
import { Skeleton } from "@/components/ui/skeleton"
import MarkdownContent from "./markdown-content"

const SLIDE_DISTANCE_PX = 20
const STAGGER_DELAY_S = 0.12

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
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\s]+)/,
    /(?:youtu\.be\/)([^?\s]+)/,
    /(?:youtube\.com\/embed\/)([^?\s]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match?.[1]) return match[1]
  }
  return null
}

interface VideoCardProps {
  video: { id: string; title: string; url: string; thumbnail: string }
}

const VideoCard = React.memo(function VideoCard({ video }: VideoCardProps) {
  const [playing, setPlaying] = React.useState(false)
  const ytId = React.useMemo(() => extractYouTubeId(video.url), [video.url])

  const handlePlay = React.useCallback(() => {
    setPlaying(true)
  }, [])

  if (!ytId) return null

  return (
    <motion.div
      variants={itemVariants}
      className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            onClick={handlePlay}
            className="relative block h-full w-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={video.thumbnail || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
              alt={video.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors duration-300 group-hover:bg-black/30">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                <Play className="ml-1 h-6 w-6 fill-primary text-primary" />
              </div>
            </div>
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 p-3.5">
        <h4 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
          {video.title}
        </h4>
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:text-primary"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </motion.div>
  )
})

function TopicSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 sm:px-10">
      <Skeleton className="mb-4 h-5 w-20 rounded-full" />
      <Skeleton className="mb-8 h-10 w-3/4 rounded-lg" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-4 w-4/5 rounded" />
      </div>
    </div>
  )
}

interface TopicViewProps {
  guideId: string
  topicId: string
}

export default function TopicView({ guideId, topicId }: TopicViewProps) {
  const router = useRouter()
  const { guide, isLoading, error } = useGuideDetail(guideId)
  const contentRef = React.useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  })

  const subtopic: Subtopic | null = React.useMemo(() => {
    if (!guide) return null
    for (const technique of guide.techniques) {
      const found = technique.subtopics.find((s) => s.id === topicId)
      if (found) return found
    }
    return null
  }, [guide, topicId])

  const techniqueName = React.useMemo(() => {
    if (!guide) return ""
    for (const technique of guide.techniques) {
      if (technique.subtopics.some((s) => s.id === topicId)) {
        return technique.title
      }
    }
    return ""
  }, [guide, topicId])

  const handleBack = React.useCallback(() => {
    router.push(`/hobby/${guideId}`)
  }, [router, guideId])

  if (isLoading) return <TopicSkeleton />

  if (error || !guide || !subtopic) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4">
        <p className="text-sm text-destructive">
          {error?.message ?? "Topic not found"}
        </p>
        <button
          onClick={handleBack}
          className="text-sm text-primary underline underline-offset-4"
        >
          Back to guide
        </button>
      </div>
    )
  }

  const sortedImages = [...subtopic.subtopic_images].sort(
    (a, b) => a.sort_order - b.sort_order
  )
  const sortedVideos = [...subtopic.subtopic_videos]

  return (
    <div className="relative min-h-svh overflow-x-hidden">
      {/* scroll progress bar */}
      <motion.div
        style={{ scaleX, transformOrigin: "left" }}
        className="fixed top-0 right-0 left-0 z-50 h-[3px] bg-gradient-to-r from-primary via-primary/80 to-primary/60"
      />

      {/* decorative background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-primary/6 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-primary/4 blur-3xl" />
      </div>

      {/* sticky header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-3.5 sm:px-10">
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

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="min-w-0 flex-1"
          >
            <p className="truncate text-xs text-muted-foreground">
              {guide.hobby} &middot; {techniqueName}
            </p>
          </motion.div>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="font-product text-lg text-primary"
          >
            HobiStic
          </motion.span>
        </div>
      </header>

      {/* main content */}
      <main ref={contentRef} className="mx-auto max-w-3xl px-6 pb-24 pt-10 sm:px-10">
        {/* title area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            {techniqueName}
          </p>
          <h1 className="mb-3 font-heading text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {subtopic.title}
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            {subtopic.text}
          </p>
        </motion.div>

        {/* videos section */}
        {sortedVideos.length > 0 && (
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-12"
          >
            <motion.p
              variants={itemVariants}
              className="mb-4 font-heading text-xs font-semibold uppercase tracking-widest text-primary"
            >
              Watch & Learn
            </motion.p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {sortedVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </motion.section>
        )}

        {/* markdown content */}
        <motion.section
          initial={{ opacity: 0, y: SLIDE_DISTANCE_PX }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: sortedVideos.length > 0 ? 0.3 : 0.15,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <p className="mb-6 font-heading text-xs font-semibold uppercase tracking-widest text-primary">
            Deep Dive
          </p>
          <article className="prose-custom">
            <MarkdownContent
              content={subtopic.content}
              images={sortedImages}
            />
          </article>
        </motion.section>
      </main>
    </div>
  )
}
