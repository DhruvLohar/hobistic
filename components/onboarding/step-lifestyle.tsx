"use client"

import { useFormContext, useWatch } from "react-hook-form"
import { cn } from "@/lib/utils"
import { LIFESTYLE_VALUES } from "@/src/utils/schemas"
import type { OnboardingFormValues } from "@/src/utils/schemas"

const LIFESTYLE_LABELS: Record<typeof LIFESTYLE_VALUES[number], { label: string; emoji: string }> = {
  student: { label: "Student", emoji: "🎓" },
  working: { label: "Working professional", emoji: "💼" },
  business: { label: "Business owner", emoji: "🏢" },
  "content-creator": { label: "Content creator", emoji: "🎬" },
  freelancer: { label: "Freelancer", emoji: "💻" },
  homemaker: { label: "Homemaker", emoji: "🏠" },
  retired: { label: "Retired", emoji: "🌅" },
}

export function StepLifestyle() {
  const {
    setValue,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>()

  const selected = useWatch({ name: "lifestyle" })

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          What's your lifestyle?
        </h2>
        <p className="text-sm text-muted-foreground">
          This helps us tailor hobby suggestions to fit your schedule.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {LIFESTYLE_VALUES.map((value) => {
          const { label, emoji } = LIFESTYLE_LABELS[value]
          const isSelected = selected === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => setValue("lifestyle", value, { shouldValidate: true })}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all",
                isSelected
                  ? "border-primary bg-primary/8 text-foreground ring-1 ring-primary"
                  : "border-border bg-muted/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              <span className="text-xl">{emoji}</span>
              <span className="text-sm font-medium">{label}</span>
            </button>
          )
        })}
      </div>

      {errors.lifestyle && (
        <p className="text-xs text-destructive">{errors.lifestyle.message}</p>
      )}
    </div>
  )
}
