import { z } from "zod"

export const loginEmailSchema = z.object({
  email: z.email("Please enter a valid email address"),
})

export const LIFESTYLE_VALUES = [
  "student",
  "working",
  "business",
  "content-creator",
  "freelancer",
  "homemaker",
  "retired",
] as const

export const PURPOSE_VALUES = [
  "escape-routine",
  "explore-new",
  "master-skill",
  "mental-wellness",
] as const

export const onboardingSchema = z.object({
  display_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name is too long"),
  hobbies: z.array(z.string()).min(1, "Pick at least one hobby"),
  lifestyle: z.enum(LIFESTYLE_VALUES, { message: "Please select a lifestyle" }),
  purpose: z.enum(PURPOSE_VALUES, { message: "Please select a purpose" }),
})

export type OnboardingFormValues = z.infer<typeof onboardingSchema>

export const loginOtpSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits"),
})

export const guideFormSchema = z.object({
  hobby: z.string().min(2, "Please enter a hobby").max(80, "Too long"),
  timePerDay: z
    .string()
    .min(1, "Required")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be a positive number"),
  reasonOfLearning: z.string().min(3, "Please describe your reason").max(200, "Too long"),
  isFirstTime: z.boolean(),
})

export type LoginEmailFormValues = z.infer<typeof loginEmailSchema>
export type LoginOtpFormValues = z.infer<typeof loginOtpSchema>
export type GuideFormValues = z.infer<typeof guideFormSchema>
