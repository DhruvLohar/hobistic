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
  onSubmit: SubmitHandler<LoginOtpFormValues>
}

export function LoginOtpStep({
  form,
  otpLength,
  otpValue,
  onOtpChange,
  onBack,
  onSubmit,
}: LoginOtpStepProps) {
  return (
    <form className="flex flex-1 flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="otp">OTP</Label>
        <InputOTP id="otp" maxLength={otpLength} value={otpValue} onChange={onOtpChange}>
          <InputOTPGroup>
            {Array.from({ length: otpLength }).map((_, index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
        {form.formState.errors.otp && (
          <p className="text-sm text-destructive">{form.formState.errors.otp.message}</p>
        )}
      </div>
      <DialogFooter className="mt-auto">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Verify OTP</Button>
      </DialogFooter>
    </form>
  )
}
