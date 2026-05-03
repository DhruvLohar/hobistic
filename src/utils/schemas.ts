import { z } from "zod"

export const loginEmailSchema = z.object({
  email: z.email("Please enter a valid email address"),
})

export const loginOtpSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits"),
})

export type LoginEmailFormValues = z.infer<typeof loginEmailSchema>
export type LoginOtpFormValues = z.infer<typeof loginOtpSchema>
