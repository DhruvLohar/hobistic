import type { SubmitHandler, UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { LoginEmailFormValues } from "@/src/utils/schemas"

interface LoginEmailStepProps {
  form: UseFormReturn<LoginEmailFormValues>
  onSubmit: SubmitHandler<LoginEmailFormValues>
}

export function LoginEmailStep({ form, onSubmit }: LoginEmailStepProps) {
  const isSubmitting = form.formState.isSubmitting

  return (
    <form
      className="flex flex-1 flex-col gap-4"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          aria-invalid={!!form.formState.errors.email}
          disabled={isSubmitting}
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      <DialogFooter className="mt-auto">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending OTP..." : "Continue"}
        </Button>
      </DialogFooter>
    </form>
  )
}
