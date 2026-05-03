"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"
import {
  loginEmailSchema,
  loginOtpSchema,
  type LoginEmailFormValues,
  type LoginOtpFormValues,
} from "@/src/utils/schemas"

const OTP_LENGTH = 6

export default function Page() {
  const [open, setOpen] = React.useState(false)
  const [step, setStep] = React.useState<"email" | "otp">("email")
  const otpSlots = React.useMemo(() => Array.from({ length: OTP_LENGTH }), [])

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

  const handleEmailSubmit = React.useCallback(
    (_values: LoginEmailFormValues) => {
      setStep("otp")
    },
    [],
  )

  const handleOtpSubmit = React.useCallback((_values: LoginOtpFormValues) => {}, [])

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
    <div className="relative min-h-svh bg-[url('/background-mobile.webp')] bg-cover bg-center bg-no-repeat md:bg-[url('/background.webp')]">
      <div className="absolute top-10 left-0 flex w-full justify-center md:w-1/2">
        <h1 className="font-product text-primary text-3xl font-bold sm:text-4xl md:text-4xl">
          HobiStic
        </h1>
      </div>

      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant="link"
            className="absolute top-6 right-6 z-10 h-auto p-0 text-base text-primary"
          >
            Login
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>{step === "email" ? "Login" : "Enter OTP"}</DialogTitle>
            <DialogDescription>
              {step === "email"
                ? "Enter your email to continue."
                : "Enter the 6-digit OTP sent to your email."}
            </DialogDescription>
          </DialogHeader>

          {step === "email" ? (
            <form
              className="flex flex-col gap-4"
              onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  aria-invalid={!!emailForm.formState.errors.email}
                  {...emailForm.register("email")}
                />
                {emailForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button type="submit">Continue</Button>
              </DialogFooter>
            </form>
          ) : (
            <form
              className="flex flex-col gap-4"
              onSubmit={otpForm.handleSubmit(handleOtpSubmit)}
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="otp">OTP</Label>
                <InputOTP
                  id="otp"
                  maxLength={OTP_LENGTH}
                  value={otpForm.watch("otp")}
                  onChange={handleOtpChange}
                >
                  <InputOTPGroup>
                    {otpSlots.map((_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                {otpForm.formState.errors.otp && (
                  <p className="text-sm text-destructive">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleBackToEmail}>
                  Back
                </Button>
                <Button type="submit">Verify OTP</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
