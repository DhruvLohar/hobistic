"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import { useForm, useWatch } from "react-hook-form"

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
  loginEmailSchema,
  loginOtpSchema,
  type LoginEmailFormValues,
  type LoginOtpFormValues,
} from "@/src/utils/schemas"

const OTP_LENGTH = 6

type LoginDialogProps = {
  open?: boolean
  children: React.ReactElement
}

export function LoginDialog({ open: initialOpen, children }: LoginDialogProps) {
  const [open, setOpen] = React.useState(initialOpen ?? false)
  const [step, setStep] = React.useState<"email" | "otp">("email")

  const emailForm = useForm<LoginEmailFormValues>({
    resolver: zodResolver(loginEmailSchema),
    defaultValues: {
      email: "",
    },
  })

  const otpForm = useForm<LoginOtpFormValues>({
    resolver: zodResolver(loginOtpSchema),
    defaultValues: {
      otp: "",
    },
  })

  const otpValue = useWatch({ control: otpForm.control, name: "otp" }) ?? ""

  const handleDialogOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen)
      if (!nextOpen) {
        setStep("email")
        emailForm.reset()
        otpForm.reset()
      }
    },
    [emailForm, otpForm],
  )

  const handleEmailSubmit = React.useCallback(() => {
    setStep("otp")
  }, [])

  const handleOtpSubmit = React.useCallback(() => {}, [])

  const handleOtpChange = React.useCallback(
    (value: string) => {
      otpForm.setValue("otp", value, { shouldValidate: true })
    },
    [otpForm],
  )

  const handleBackToEmail = React.useCallback(() => {
    setStep("email")
    otpForm.reset()
  }, [otpForm])

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="w-[min(94vw,520px)] max-w-130 gap-0 overflow-hidden bg-secondary p-0">
        <div className="relative aspect-square w-full shrink-0 overflow-hidden">
          <Image src="/login-modal.webp" alt="Login" fill className="object-cover" priority />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-secondary via-secondary/80 to-transparent" />
        </div>

        <div className="flex flex-1 flex-col gap-8 p-8">
          <div>
            <DialogTitle className="text-lg font-semibold">{step === "email" ? "Login" : "Enter OTP"}</DialogTitle>
            <DialogDescription>
              {step === "email"
                ? "Enter your email to continue."
                : "Enter the 6-digit OTP sent to your email."}
            </DialogDescription>
          </div>

          {step === "email" ? (
            <LoginEmailStep form={emailForm} onSubmit={handleEmailSubmit} />
          ) : (
            <LoginOtpStep
              form={otpForm}
              otpLength={OTP_LENGTH}
              otpValue={otpValue}
              onOtpChange={handleOtpChange}
              onBack={handleBackToEmail}
              onSubmit={handleOtpSubmit}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
