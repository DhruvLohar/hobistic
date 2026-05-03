"use client"

import { motion } from "motion/react"
import { cn } from "@/lib/utils"

const STEP_LABELS = ["Name", "Hobbies", "Lifestyle", "Purpose"]

const DOT_TRANSITION = { type: "spring" as const, stiffness: 400, damping: 28 }

type OnboardingProgressProps = {
  currentStep: number
}

export function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  return (
    <div className="flex items-center gap-2">
      {STEP_LABELS.map((label, i) => {
        const done = i < currentStep
        const active = i === currentStep
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <motion.div
                layout
                transition={DOT_TRANSITION}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                  done && "bg-primary text-primary-foreground",
                  active && "bg-primary/15 ring-2 ring-primary text-primary",
                  !done && !active && "bg-muted text-muted-foreground"
                )}
              >
                {done ? "✓" : i + 1}
              </motion.div>
              <span
                className={cn(
                  "text-[10px] font-medium tracking-wide",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className="mb-4 h-px w-8 bg-border" />
            )}
          </div>
        )
      })}
    </div>
  )
}
