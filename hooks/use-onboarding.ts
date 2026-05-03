"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { OnboardingFormValues } from "@/src/utils/schemas"

async function submitOnboarding(data: OnboardingFormValues): Promise<void> {
  const res = await fetch("/api/onboarding", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error(json.error ?? "Failed to save profile")
  }
}

export function useOnboarding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: submitOnboarding,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth"] })
    },
  })
}
