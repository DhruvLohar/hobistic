"use client"

import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { OnboardingFormValues } from "@/src/utils/schemas"

export function StepName() {
  const {
    register,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>()

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          What should we call you?
        </h2>
        <p className="text-sm text-muted-foreground">
          This is how your name will appear on your dashboard.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="display_name">Your name</Label>
        <Input
          id="display_name"
          placeholder="e.g. Alex"
          autoFocus
          className="h-12 rounded-2xl text-base"
          {...register("display_name")}
        />
        {errors.display_name && (
          <p className="text-xs text-destructive">{errors.display_name.message}</p>
        )}
      </div>
    </div>
  )
}
