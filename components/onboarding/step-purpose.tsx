"use client"

import { useFormContext, useWatch } from "react-hook-form"
import { cn } from "@/lib/utils"
import { PURPOSE_VALUES } from "@/src/utils/schemas"
import type { OnboardingFormValues } from "@/src/utils/schemas"

const PURPOSE_LABELS: Record<typeof PURPOSE_VALUES[number], { label: string; description: string; emoji: string }> = {
  "escape-routine": {
    label: "Escape the routine",
    description: "I want something fun to break out of my daily grind",
    emoji: "✈️",
  },
  "explore-new": {
    label: "Explore new things",
    description: "I'm curious and love discovering new interests",
    emoji: "🔭",
  },
  "master-skill": {
    label: "Master a skill",
    description: "I want to get seriously good at something",
    emoji: "🏆",
  },
  "mental-wellness": {
    label: "Mental wellness",
    description: "I want a calming outlet to recharge and destress",
    emoji: "🧘",
  },
}

export function StepPurpose() {
  const {
    setValue,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>()

  const selected = useWatch({ name: "purpose" })

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          What's your goal?
        </h2>
        <p className="text-sm text-muted-foreground">
          We'll use this to focus your hobby journey.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {PURPOSE_VALUES.map((value) => {
          const { label, description, emoji } = PURPOSE_LABELS[value]
          const isSelected = selected === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => setValue("purpose", value, { shouldValidate: true })}
              className={cn(
                "flex items-start gap-4 rounded-2xl border px-4 py-4 text-left transition-all",
                isSelected
                  ? "border-primary bg-primary/8 ring-1 ring-primary"
                  : "border-border bg-muted/30 hover:border-primary/30"
              )}
            >
              <span className="mt-0.5 text-2xl">{emoji}</span>
              <div>
                <p className={cn("text-sm font-semibold", isSelected ? "text-primary" : "text-foreground")}>
                  {label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
              </div>
            </button>
          )
        })}
      </div>

      {errors.purpose && (
        <p className="text-xs text-destructive">{errors.purpose.message}</p>
      )}
    </div>
  )
}
