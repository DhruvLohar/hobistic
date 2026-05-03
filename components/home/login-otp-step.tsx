import type { SubmitHandler, UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"
import type { LoginOtpFormValues } from "@/src/utils/schemas"

interface LoginOtpStepProps {
  form: UseFormReturn<LoginOtpFormValues>
  otpLength: number
  otpValue: string
  onOtpChange: (value: string) => void
  onBack: () => void
  onResend: () => Promise<void>
  isResending: boolean
  onSubmit: SubmitHandler<LoginOtpFormValues>
}

export function LoginOtpStep({
  form,
  otpLength,
  otpValue,
  onOtpChange,
  onBack,
  onResend,
  isResending,
  onSubmit,
}: LoginOtpStepProps) {
  const isSubmitting = form.formState.isSubmitting

  return (
    <form
      className="flex flex-1 flex-col gap-4"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="otp">OTP</Label>
        <InputOTP
          id="otp"
          maxLength={otpLength}
          value={otpValue}
          onChange={onOtpChange}
          disabled={isSubmitting}
        >
          <InputOTPGroup>
            {Array.from({ length: otpLength }).map((_, index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
        {form.formState.errors.otp && (
          <p className="text-sm text-destructive">
            {form.formState.errors.otp.message}
          </p>
        )}
        <Button
          type="button"
          variant="link"
          className="h-auto w-fit px-0"
          onClick={onResend}
          disabled={isSubmitting || isResending}
        >
          {isResending ? "Resending OTP..." : "Resend OTP"}
        </Button>
      </div>
      <DialogFooter className="mt-auto">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Verifying..." : "Verify OTP"}
        </Button>
      </DialogFooter>
    </form>
  )
}
