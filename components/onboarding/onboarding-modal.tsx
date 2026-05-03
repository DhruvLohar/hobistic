"use client"

import * as React from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AnimatePresence, motion, MotionConfig } from "motion/react"
import { ArrowRight, Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { OnboardingProgress } from "./onboarding-progress"
import { StepName } from "./step-name"
import { StepHobbies } from "./step-hobbies"
import { StepLifestyle } from "./step-lifestyle"
import { StepPurpose } from "./step-purpose"
import { useOnboarding } from "@/hooks/use-onboarding"
import { onboardingSchema, type OnboardingFormValues } from "@/src/utils/schemas"

const TOTAL_STEPS = 4

// Fields to validate per step before advancing
const STEP_FIELDS: Array<Array<keyof OnboardingFormValues>> = [
  ["display_name"],
  ["hobbies"],
  ["lifestyle"],
  ["purpose"],
]

const SLIDE_DISTANCE_PX = 32
const STEP_TRANSITION = { type: "tween" as const, ease: "easeOut" as const, duration: 0.3 }

type SlideDirection = 1 | -1

export function OnboardingModal() {
  const [step, setStep] = React.useState(0)
  const [direction, setDirection] = React.useState<SlideDirection>(1)

  const methods = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { display_name: "", hobbies: [], lifestyle: undefined, purpose: undefined },
    mode: "onChange",
  })

  const { mutateAsync, isPending } = useOnboarding()

  const goNext = React.useCallback(async () => {
    const fields = STEP_FIELDS[step]
    const valid = await methods.trigger(fields)
    if (!valid) return
    setDirection(1)
    setStep((s) => s + 1)
  }, [methods, step])

  const goPrev = React.useCallback(() => {
    setDirection(-1)
    setStep((s) => s - 1)
  }, [])

  const onSubmit = React.useCallback(
    async (data: OnboardingFormValues) => {
      try {
        await mutateAsync(data)
        toast.success("Welcome to HobiStic!")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong")
      }
    },
    [mutateAsync]
  )

  const isLastStep = step === TOTAL_STEPS - 1

  return (
    <MotionConfig reducedMotion="user">
      <Dialog open>
        <DialogContent
          showCloseButton={false}
          // Prevent closing via Escape or backdrop click
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="max-w-lg gap-0 overflow-hidden p-0"
        >
          {/* Header */}
          <div className="border-b border-border px-6 pb-4 pt-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="font-heading text-lg font-semibold">
                Welcome to HobiStic
              </DialogTitle>
              <DialogDescription>
                A quick setup so we can personalise your experience.
              </DialogDescription>
            </DialogHeader>
            <OnboardingProgress currentStep={step} />
          </div>

          {/* Step content */}
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <div className="relative max-h-[60svh] min-h-[280px] overflow-y-auto overflow-x-hidden px-6 py-6 scrollbar-none sm:min-h-[340px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={step}
                    custom={direction}
                    initial={{ opacity: 0, x: direction * SLIDE_DISTANCE_PX }}
                    animate={{ opacity: 1, x: 0, transition: STEP_TRANSITION }}
                    exit={{ opacity: 0, x: direction * -SLIDE_DISTANCE_PX, transition: { ...STEP_TRANSITION, duration: 0.2 } }}
                  >
                    {step === 0 && <StepName />}
                    {step === 1 && <StepHobbies />}
                    {step === 2 && <StepLifestyle />}
                    {step === 3 && <StepPurpose />}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-border px-6 py-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={goPrev}
                  disabled={step === 0}
                  className="text-muted-foreground"
                >
                  Back
                </Button>

                {isLastStep ? (
                  <Button type="submit" disabled={isPending} className="rounded-full px-6">
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Finish setup
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={goNext}
                    className="rounded-full px-6"
                  >
                    Continue
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </MotionConfig>
  )
}
