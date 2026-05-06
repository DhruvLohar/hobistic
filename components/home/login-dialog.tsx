"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"

import { X } from "lucide-react"

import { LoginEmailStep } from "@/components/home/login-email-step"
import { LoginOtpStep } from "@/components/home/login-otp-step"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  loginEmailSchema,
  loginOtpSchema,
  type LoginEmailFormValues,
  type LoginOtpFormValues,
} from "@/src/utils/schemas"
import { createClient } from "@/lib/supabase/client"
import { useAnalytics } from "@/hooks/use-analytics"

const OTP_LENGTH = 6

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)")
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  return isMobile
}

type LoginDialogProps = {
  open?: boolean
  children: React.ReactElement
}

interface LoginContentProps {
  step: "email" | "otp"
  authError: string | null
  emailForm: ReturnType<typeof useForm<LoginEmailFormValues>>
  otpForm: ReturnType<typeof useForm<LoginOtpFormValues>>
  otpValue: string
  isResendingOtp: boolean
  onEmailSubmit: (values: LoginEmailFormValues) => Promise<void>
  onOtpSubmit: (values: LoginOtpFormValues) => Promise<void>
  onOtpChange: (value: string) => void
  onResendOtp: () => Promise<void>
  onBackToEmail: () => void
  onClose: () => void
  TitleComponent: React.ElementType
  DescriptionComponent: React.ElementType
  CloseComponent?: React.ElementType
}

function LoginContent({
  step,
  authError,
  emailForm,
  otpForm,
  otpValue,
  isResendingOtp,
  onEmailSubmit,
  onOtpSubmit,
  onOtpChange,
  onResendOtp,
  onBackToEmail,
  onClose,
  TitleComponent,
  DescriptionComponent,
  CloseComponent,
}: LoginContentProps) {
  return (
    <>
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden sm:aspect-square sm:max-h-64">
        {step === "otp" && (
          CloseComponent ? (
            <CloseComponent className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </CloseComponent>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          )
        )}
        <Image
          src="/login-modal.webp"
          alt="Login"
          fill
          className="object-cover"
          priority
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-secondary via-secondary/80 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-8 p-8">
        <div className="gap-2">
          <TitleComponent className="text-2xl font-semibold">
            {step === "email" ? "Login" : "Enter OTP"}
          </TitleComponent>
          <DescriptionComponent className="text-lg">
            {step === "email"
              ? "Enter your email to continue."
              : "Enter the 6-digit OTP sent to your email."}
          </DescriptionComponent>
          {authError && (
            <p className="mt-2 text-sm text-destructive">{authError}</p>
          )}
        </div>

        {step === "email" ? (
          <LoginEmailStep form={emailForm} onSubmit={onEmailSubmit} />
        ) : (
          <LoginOtpStep
            form={otpForm}
            otpLength={OTP_LENGTH}
            otpValue={otpValue}
            onOtpChange={onOtpChange}
            onBack={onBackToEmail}
            onResend={onResendOtp}
            isResending={isResendingOtp}
            onSubmit={onOtpSubmit}
          />
        )}
      </div>
    </>
  )
}

export function LoginDialog({ open: initialOpen, children }: LoginDialogProps) {
  const router = useRouter()
  const { trackEvent } = useAnalytics()
  const isMobile = useIsMobile()

  const supabase = React.useMemo(() => {
    if (typeof window === "undefined") return null
    return createClient()
  }, [])

  const [open, setOpen] = React.useState(initialOpen ?? false)
  const [step, setStep] = React.useState<"email" | "otp">("email")
  const [authError, setAuthError] = React.useState<string | null>(null)
  const [authInfo, setAuthInfo] = React.useState<string | null>(null)
  const [isResendingOtp, setIsResendingOtp] = React.useState(false)

  const emailForm = useForm<LoginEmailFormValues>({
    resolver: zodResolver(loginEmailSchema),
    defaultValues: { email: "" },
  })

  const otpForm = useForm<LoginOtpFormValues>({
    resolver: zodResolver(loginOtpSchema),
    defaultValues: { otp: "" },
  })

  const otpValue = useWatch({ control: otpForm.control, name: "otp" }) ?? ""

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen)
      if (!nextOpen) {
        setStep("email")
        setAuthError(null)
        setAuthInfo(null)
        setIsResendingOtp(false)
        emailForm.reset()
        otpForm.reset()
      }
    },
    [emailForm, otpForm]
  )

  const handleEmailSubmit = React.useCallback(
    async ({ email }: LoginEmailFormValues) => {
      setAuthError(null)
      setAuthInfo(null)
      if (!supabase) { setAuthError("Authentication is unavailable right now."); return }
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) { setAuthError(error.message); return }
      otpForm.reset()
      setStep("otp")
      setAuthInfo("OTP sent. Check your email.")
      trackEvent("OtpRequested")
    },
    [otpForm, supabase, trackEvent]
  )

  const handleOtpSubmit = React.useCallback(
    async ({ otp }: LoginOtpFormValues) => {
      setAuthError(null)
      setAuthInfo(null)
      if (!supabase) { setAuthError("Authentication is unavailable right now."); return }
      const email = emailForm.getValues("email")
      const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" })
      if (error) { setAuthError(error.message); return }
      trackEvent("OtpVerified")
      handleOpenChange(false)
      router.push("/dashboard")
    },
    [emailForm, handleOpenChange, router, supabase, trackEvent]
  )

  const handleResendOtp = React.useCallback(async () => {
    setAuthError(null)
    setAuthInfo(null)
    if (!supabase) { setAuthError("Authentication is unavailable right now."); return }
    const email = emailForm.getValues("email")
    if (!email) { setAuthError("Please enter your email again."); setStep("email"); return }
    setIsResendingOtp(true)
    const { error } = await supabase.auth.signInWithOtp({ email })
    setIsResendingOtp(false)
    if (error) { setAuthError(error.message); return }
    setAuthInfo("A new OTP has been sent to your email.")
    trackEvent("OtpRequested", { resend: true })
  }, [emailForm, supabase, trackEvent])

  const handleOtpChange = React.useCallback(
    (value: string) => otpForm.setValue("otp", value, { shouldValidate: true }),
    [otpForm]
  )

  const handleBackToEmail = React.useCallback(() => {
    setStep("email")
    otpForm.reset()
  }, [otpForm])

  const contentProps = {
    step,
    authError,
    emailForm,
    otpForm,
    otpValue,
    isResendingOtp,
    onEmailSubmit: handleEmailSubmit,
    onOtpSubmit: handleOtpSubmit,
    onOtpChange: handleOtpChange,
    onResendOtp: handleResendOtp,
    onBackToEmail: handleBackToEmail,
    onClose: () => handleOpenChange(false),
  }

  if (isMobile) {
    return (
      <Drawer
        open={open}
        onOpenChange={handleOpenChange}
        dismissible={step === "email"}
      >
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        {/* scrollable sheet that rises above the keyboard */}
        <DrawerContent className="bg-secondary before:bg-secondary max-h-[92svh] overflow-y-auto">
          <LoginContent
            {...contentProps}
            TitleComponent={DrawerTitle}
            DescriptionComponent={DrawerDescription}
            CloseComponent={DrawerClose}
          />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="w-[min(94vw,520px)] max-w-130 gap-0 overflow-hidden bg-secondary p-0"
        onInteractOutside={(e) => { if (step === "otp") e.preventDefault() }}
        onEscapeKeyDown={(e) => { if (step === "otp") e.preventDefault() }}
      >
        <LoginContent
          {...contentProps}
          TitleComponent={DialogTitle}
          DescriptionComponent={DialogDescription}
        />
      </DialogContent>
    </Dialog>
  )
}
