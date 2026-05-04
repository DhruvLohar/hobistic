"use client"

import * as React from "react"
import {
  motion,
  useMotionValue,
  useSpring,
  useVelocity,
  useTransform,
} from "motion/react"
import { BookOpen } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { useGuides } from "@/hooks/use-guides"
import GuideCard from "./guide-card"

const TRACKER_W = 300
const TRACKER_H = 380
const POSITION_SPRING = { stiffness: 130, damping: 22, restDelta: 0.001 }
const ROTATION_SPRING = { stiffness: 200, damping: 28 }
const VELOCITY_INPUT: [number, number] = [-2500, 2500]
const ROTATION_OUTPUT: [number, number] = [-12, 12]
const TRACKER_TRANSITION = { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }
const IMAGE_TRANSITION = { duration: 0.38, ease: "easeOut" as const }

function GuidesSkeleton() {
  return (
    <div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="border-b border-border/50 py-9 first:border-t"
        >
          <div className="mb-3 flex items-center gap-2.5">
            <Skeleton className="h-2.5 w-6 rounded" />
            <Skeleton className="h-2.5 w-28 rounded-full" />
          </div>
          <Skeleton className="h-9 w-1/2 rounded-lg" />
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
      <p className="font-heading text-base font-semibold text-foreground">
        No guides yet
      </p>
      <p className="max-w-xs text-sm text-muted-foreground">
        Fill in the form above and hit Go to generate your first personalized
        hobby guide.
      </p>
    </motion.div>
  )
}

export default function GuidesGrid() {
  const { guides, isLoading, error } = useGuides()
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  const mouseX = useMotionValue(-9999)
  const mouseY = useMotionValue(-9999)
  const smoothX = useSpring(mouseX, POSITION_SPRING)
  const smoothY = useSpring(mouseY, POSITION_SPRING)
  const velX = useVelocity(smoothX)
  const rawRotation = useTransform(velX, VELOCITY_INPUT, ROTATION_OUTPUT)
  const smoothRotation = useSpring(rawRotation, ROTATION_SPRING)

  const isHovering = hoveredIndex !== null

  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [mouseX, mouseY])

  const handleHoverEnd = React.useCallback(() => setHoveredIndex(null), [])

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
    <div className="relative">
      {/* ── Floating image tracker — desktop only ── */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-50 hidden overflow-hidden rounded-2xl shadow-2xl lg:block"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          rotate: smoothRotation,
          width: TRACKER_W,
          height: TRACKER_H,
        }}
        animate={{
          scale: isHovering ? 1 : 0.65,
          opacity: isHovering ? 1 : 0,
        }}
        transition={TRACKER_TRANSITION}
      >
        {/* frosted edge ring */}
        <div className="pointer-events-none absolute inset-0 z-20 rounded-2xl ring-1 ring-white/25 dark:ring-white/10" />
        {/* bottom vignette */}
        <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        {guides.map((guide, i) =>
          guide.cover_image ? (
            <motion.img
              key={guide.id}
              src={guide.cover_image}
              alt={guide.hobby}
              className="absolute inset-0 h-full w-full object-cover"
              animate={{
                opacity: hoveredIndex === i ? 1 : 0,
                scale: hoveredIndex === i ? 1 : 1.08,
              }}
              transition={IMAGE_TRANSITION}
            />
          ) : (
            <motion.div
              key={guide.id}
              className="absolute inset-0 bg-gradient-to-br from-primary/60 via-primary/20 to-transparent"
              animate={{ opacity: hoveredIndex === i ? 1 : 0 }}
              transition={IMAGE_TRANSITION}
            />
          )
        )}
      </motion.div>

      {/* ── Guide list ── */}
      <div onMouseLeave={handleHoverEnd}>
        {guides.map((guide, i) => (
          <GuideCard
            key={guide.id}
            guide={guide}
            index={i}
            totalCount={guides.length}
            onHoverStart={() => setHoveredIndex(i)}
            onHoverEnd={handleHoverEnd}
          />
        ))}
      </div>
    </div>
  )
}
