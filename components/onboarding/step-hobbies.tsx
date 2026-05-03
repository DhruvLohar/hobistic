"use client"

import * as React from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { X, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { OnboardingFormValues } from "@/src/utils/schemas"

const PRESET_HOBBIES = [
  "Guitar", "Piano", "Painting", "Sketching", "Photography",
  "Cooking", "Yoga", "Cycling", "Reading", "Writing",
  "Dancing", "Chess",
]

export function StepHobbies() {
  const {
    setValue,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>()

  const selected: string[] = useWatch({ name: "hobbies" }) ?? []
  const [inputValue, setInputValue] = React.useState("")

  const toggle = React.useCallback(
    (hobby: string) => {
      const trimmed = hobby.trim()
      if (!trimmed) return
      const next = selected.includes(trimmed)
        ? selected.filter((h) => h !== trimmed)
        : [...selected, trimmed]
      setValue("hobbies", next, { shouldValidate: true })
    },
    [selected, setValue]
  )

  const addCustom = React.useCallback(() => {
    const trimmed = inputValue.trim()
    if (!trimmed || selected.includes(trimmed)) {
      setInputValue("")
      return
    }
    setValue("hobbies", [...selected, trimmed], { shouldValidate: true })
    setInputValue("")
  }, [inputValue, selected, setValue])

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault()
        addCustom()
      }
    },
    [addCustom]
  )

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          What are your hobbies?
        </h2>
        <p className="text-sm text-muted-foreground">
          Pick from the list or type your own. You can add as many as you like.
        </p>
      </div>

      {/* Custom input */}
      <div className="space-y-2">
        <Label>Add a hobby</Label>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Pottery"
            className="h-10 rounded-xl"
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!inputValue.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Preset pills */}
      <div className="flex flex-wrap gap-2">
        {PRESET_HOBBIES.map((hobby) => {
          const isSelected = selected.includes(hobby)
          return (
            <button
              key={hobby}
              type="button"
              onClick={() => toggle(hobby)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {hobby}
            </button>
          )
        })}
      </div>

      {/* Selected custom hobbies (ones not in presets) */}
      {selected.filter((h) => !PRESET_HOBBIES.includes(h)).length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Your additions
          </p>
          <div className="flex flex-wrap gap-2">
            {selected
              .filter((h) => !PRESET_HOBBIES.includes(h))
              .map((hobby) => (
                <span
                  key={hobby}
                  className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
                >
                  {hobby}
                  <button
                    type="button"
                    onClick={() => toggle(hobby)}
                    className="ml-0.5 rounded-full hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
          </div>
        </div>
      )}

      {errors.hobbies && (
        <p className="text-xs text-destructive">{errors.hobbies.message}</p>
      )}
    </div>
  )
}
