"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { GuideFormValues } from "@/src/utils/schemas"

export interface Guide {
  id: string
  hobby: string
  genre: string
  status: "processing" | "completed"
  time_per_day: string
  reason_of_learning: string
  is_first_time: boolean
  created_at: string
}

const GUIDES_QUERY_KEY = ["guides"] as const

export function useGuides() {
  const guidesQuery = useQuery<Guide[], Error>({
    queryKey: GUIDES_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch("/api/guides")
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Failed to fetch guides")
      }
      const data = await res.json()
      return data.guides as Guide[]
    },
  })

  return {
    guides: guidesQuery.data ?? [],
    isLoading: guidesQuery.isLoading,
    error: guidesQuery.error,
  }
}

export function useCreateGuide() {
  const queryClient = useQueryClient()

  const createMutation = useMutation<void, Error, GuideFormValues>({
    mutationFn: async (values) => {
      const res = await fetch("/api/guides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Failed to create guide")
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: GUIDES_QUERY_KEY })
    },
  })

  const createGuide = React.useCallback(
    async (values: GuideFormValues) => {
      await createMutation.mutateAsync(values)
    },
    [createMutation]
  )

  return {
    createGuide,
    isCreating: createMutation.isPending,
    error: createMutation.error,
  }
}
