"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "motion/react"
import { ArrowRight, Loader2 } from "lucide-react"

import { guideFormSchema, type GuideFormValues } from "@/src/utils/schemas"
import { useCreateGuide } from "@/hooks/use-guides"

function useAutoWidth(value: string, placeholder: string) {
  const sizerRef = React.useRef<HTMLSpanElement>(null)
  const [width, setWidth] = React.useState<number | undefined>(undefined)

  React.useLayoutEffect(() => {
    if (sizerRef.current) {
      setWidth(sizerRef.current.offsetWidth + 4)
    }
  }, [value, placeholder])

  return { sizerRef, width }
}

interface InlineInputProps {
  placeholder: string
  value: string
  onChange: (v: string) => void
  error?: string
  type?: string
}

const InlineInput = React.memo(function InlineInput({
  placeholder,
  value,
  onChange,
  error,
  type = "text",
}: InlineInputProps) {
  const { sizerRef, width } = useAutoWidth(value, placeholder)
  const hasValue = value.length > 0

  return (
    <>
      {/* hidden ghost span — drives width measurement */}
      <span
        ref={sizerRef}
        aria-hidden
        className="pointer-events-none invisible absolute whitespace-pre font-heading text-2xl font-bold sm:text-3xl"
      >
        {value || placeholder}
      </span>

      <motion.input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        animate={{ width: width ?? "auto" }}
        transition={{ duration: 0.18, ease: "linear" }}
        className={[
          "bg-transparent outline-none",
          "font-heading text-2xl font-bold sm:text-3xl",
          "transition-colors duration-150",
          error
            ? "text-destructive border-b-[2.5px] border-destructive/70 placeholder:text-destructive/30"
            : hasValue
              ? "text-primary border-b-[2.5px] border-primary/60 placeholder:text-foreground/25"
              : "text-foreground/30 border-b-2 border-foreground/15 placeholder:text-foreground/25",
        ].join(" ")}
        style={{ minWidth: "3ch" }}
      />
    </>
  )
})

interface FirstTimeToggleProps {
  value: boolean
  onChange: (v: boolean) => void
}

const FirstTimeToggle = React.memo(function FirstTimeToggle({
  value,
  onChange,
}: FirstTimeToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={[
        "relative inline-block cursor-pointer select-none",
        "font-heading text-2xl font-bold sm:text-3xl",
        "transition-colors duration-150",
        "border-b-[2.5px]",
        value
          ? "border-primary/60 text-primary"
          : "border-foreground/20 text-foreground/50 hover:border-primary/40 hover:text-primary/70",
      ].join(" ")}
    >
      {value ? "for the first time" : "not for the first time"}
    </button>
  )
})

type TimeUnit = "hours" | "minutes"

const TIME_CONSTRAINTS: Record<TimeUnit, { min: number; max: number }> = {
  hours: { min: 1, max: 6 },
  minutes: { min: 30, max: 60 },
}

interface GuideFormProps {
  onSuccess?: () => void
}

export default function GuideForm({ onSuccess }: GuideFormProps) {
  const { createGuide, isCreating, error: createError } = useCreateGuide()
  const [unit, setUnit] = React.useState<TimeUnit>("hours")

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GuideFormValues>({
    resolver: zodResolver(guideFormSchema),
    defaultValues: {
      hobby: "",
      timePerDay: "",
      reasonOfLearning: "",
      isFirstTime: true,
    },
  })

  const hobby = watch("hobby")
  const timePerDay = watch("timePerDay")
  const reasonOfLearning = watch("reasonOfLearning")
  const isFirstTime = watch("isFirstTime")

  const handleUnitToggle = React.useCallback(() => {
    const next: TimeUnit = unit === "hours" ? "minutes" : "hours"
    const { min, max } = TIME_CONSTRAINTS[next]
    // clamp current value into new unit's range
    const current = Number(timePerDay)
    if (!isNaN(current) && current > 0) {
      const clamped = Math.min(max, Math.max(min, current))
      setValue("timePerDay", String(clamped), { shouldValidate: true })
    }
    setUnit(next)
  }, [unit, timePerDay, setValue])

  const onSubmit = React.useCallback(
    async (values: GuideFormValues) => {
      const hoursValue =
        unit === "minutes"
          ? String(Number(values.timePerDay) / 60)
          : values.timePerDay
      await createGuide({ ...values, timePerDay: hoursValue })
      onSuccess?.()
    },
    [createGuide, onSuccess, unit]
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="rounded-2xl border border-border bg-card/80 px-6 py-8 shadow-sm backdrop-blur-sm sm:px-10 sm:py-10">

          {/* the paragraph — all inline, wraps naturally */}
          <p className="relative font-heading text-2xl font-bold leading-[1.55] text-foreground sm:text-3xl">
            {"I want to learn "}
            <InlineInput
              placeholder="guitar"
              value={hobby}
              onChange={(v) => setValue("hobby", v, { shouldValidate: true })}
              error={errors.hobby?.message}
            />
            {", I can spend "}
            <InlineInput
              placeholder={unit === "hours" ? "2" : "45"}
              value={timePerDay}
              onChange={(v) => setValue("timePerDay", v, { shouldValidate: true })}
              error={errors.timePerDay?.message}
              type="number"
            />
            {" "}
            <button
              type="button"
              onClick={handleUnitToggle}
              className={[
                "relative inline-block cursor-pointer select-none",
                "font-heading text-2xl font-bold sm:text-3xl",
                "transition-colors duration-150",
                "border-b-[2.5px] border-primary/60 text-primary",
                "hover:border-primary hover:opacity-80",
              ].join(" ")}
            >
              {unit}
            </button>
            {" per day, and my reason for learning is to "}
            <InlineInput
              placeholder="play at friend's birthday"
              value={reasonOfLearning}
              onChange={(v) => setValue("reasonOfLearning", v, { shouldValidate: true })}
              error={errors.reasonOfLearning?.message}
            />
            {". I am learning it "}
            <FirstTimeToggle
              value={isFirstTime}
              onChange={(v) => setValue("isFirstTime", v)}
            />
            {"."}
          </p>

          <AnimatePresence>
            {createError && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-5 text-sm text-destructive"
              >
                {createError.message}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isCreating}
              className={[
                "group flex items-center gap-2 rounded-full bg-primary px-6 py-2.5",
                "font-heading text-sm font-semibold text-primary-foreground",
                "transition-all duration-200 hover:gap-3 hover:pr-5",
                "disabled:cursor-not-allowed disabled:opacity-60",
              ].join(" ")}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating…</span>
                </>
              ) : (
                <>
                  <span>Let the magic begin</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  )
}
