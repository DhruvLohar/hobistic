"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const DotLottieReact = React.lazy(async () => {
  const mod = await import("@lottiefiles/dotlottie-react")
  return { default: mod.DotLottieReact }
})

const HOBBY_FACTS = [
  "Learning a new skill rewires your brain — literally. Neuroplasticity kicks in within the first hour.",
  "People who practice hobbies regularly report 30% less stress than those who don't.",
  "The first 20 hours of deliberate practice are where the biggest breakthroughs happen.",
  "Creative hobbies boost problem-solving skills in unrelated areas of your life.",
  "Mastery isn't about talent — it's about showing up consistently, even for just 15 minutes a day.",
  "Your brain releases dopamine when you learn something new, making hobbies naturally addictive.",
  "Studies show that hobby practitioners sleep better and have stronger immune systems.",
  "The best time to practice is right after you wake up — your brain is most receptive then.",
  "Sharing your hobby with others accelerates learning by up to 50%.",
  "Every expert was once a beginner. The only difference is they kept going.",
]

const FACT_ROTATE_MS = 4000
const FLIP_DURATION_S = 0.8

interface HobbyStarterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isProcessing: boolean
}

function ProcessingFace() {
  const [factIndex, setFactIndex] = React.useState(0)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % HOBBY_FACTS.length)
    }, FACT_ROTATE_MS)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center gap-6 px-6 py-8 sm:px-8 sm:py-10">
      <div className="flex h-[200px] w-[200px] items-center justify-center">
        <React.Suspense
          fallback={
            <div className="h-[200px] w-[200px] animate-pulse rounded-full bg-primary/10" />
          }
        >
          <DotLottieReact
            src="https://lottie.host/2e677740-ca87-4c43-a8cf-8e57de741a5f/HHM8YjNBMe.lottie"
            autoplay
            loop
            className="h-[200px] w-[200px]"
          />
        </React.Suspense>
      </div>

      <div className="space-y-3 text-center">
        <h3 className="font-heading text-xl font-bold text-foreground">
          Crafting your guide...
        </h3>
        <p className="text-sm text-muted-foreground">
          Our AI is building a personalized learning path just for you
        </p>
      </div>

      <div className="relative h-20 w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={factIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 text-center text-sm leading-relaxed text-muted-foreground italic"
          >
            &ldquo;{HOBBY_FACTS[factIndex]}&rdquo;
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-primary"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  )
}

interface CompletedFaceProps {
  onClose: () => void
}

function CompletedFace({ onClose }: CompletedFaceProps) {
  return (
    <div className="flex flex-col items-center gap-5 px-6 py-8 sm:px-8 sm:py-10">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.3,
        }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
      >
        <motion.svg
          viewBox="0 0 24 24"
          className="h-10 w-10 text-primary"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M20 6L9 17l-5-5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
          />
        </motion.svg>
      </motion.div>

      <DialogHeader className="space-y-2 text-center">
        <DialogTitle className="font-heading text-3xl font-bold tracking-tight text-foreground">
          Congratulations!
        </DialogTitle>
        <DialogDescription className="mx-auto max-w-sm text-base leading-relaxed text-muted-foreground">
          You just started a hobby, which already puts you ahead of people who
          never even try. You are now ahead of at least{" "}
          <span className="font-semibold text-foreground">85%</span> of people
          who stay stuck at day zero.
        </DialogDescription>
      </DialogHeader>

      <Button
        type="button"
        onClick={onClose}
        className="h-11 rounded-full px-7 font-heading text-sm tracking-wide uppercase"
      >
        Let&apos;s build momentum
      </Button>
    </div>
  )
}

export function HobbyStarterModal({
  open,
  onOpenChange,
  isProcessing,
}: HobbyStarterModalProps) {
  const [hasFlipped, setHasFlipped] = React.useState(false)

  React.useEffect(() => {
    if (!isProcessing && open) {
      const timer = setTimeout(() => setHasFlipped(true), 200)
      return () => clearTimeout(timer)
    }
  }, [isProcessing, open])

  React.useEffect(() => {
    if (!open) {
      setHasFlipped(false)
    }
  }, [open])

  const handleClose = React.useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  return (
    <>
      {/* confetti layer — plays when card flips to completed */}
      <AnimatePresence>
        {open && hasFlipped && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="pointer-events-none fixed inset-0 z-[49]"
          >
            <React.Suspense fallback={null}>
              <DotLottieReact
                src="/confetti.lottie"
                autoplay
                className="h-full w-full"
              />
            </React.Suspense>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={open} onOpenChange={isProcessing ? () => {} : onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="max-w-md gap-0 overflow-visible border-none bg-transparent p-0 shadow-none"
          style={{ perspective: "1200px" }}
          onInteractOutside={(e) => {
            if (isProcessing) e.preventDefault()
          }}
          onEscapeKeyDown={(e) => {
            if (isProcessing) e.preventDefault()
          }}
        >
          <motion.div
            animate={{ rotateY: hasFlipped ? 180 : 0 }}
            transition={{
              duration: FLIP_DURATION_S,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              transformStyle: "preserve-3d",
            }}
            className="relative"
          >
            {/* front face — processing */}
            <div
              className="rounded-2xl border border-border bg-card shadow-lg"
              style={{ backfaceVisibility: "hidden" }}
            >
              {!hasFlipped && <ProcessingFace />}
            </div>

            {/* back face — completed */}
            <div
              className="absolute inset-0 rounded-2xl border border-border bg-card shadow-lg"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              {hasFlipped && <CompletedFace onClose={handleClose} />}
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  )
}
