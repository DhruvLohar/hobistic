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
  subtopic_count?: number
  cover_image?: string | null
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

  const createMutation = useMutation<Guide, Error, GuideFormValues>({
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
      const body = await res.json()
      return body.guide as Guide
    },
    onSuccess: async (newGuide) => {
      queryClient.setQueryData<Guide[]>(GUIDES_QUERY_KEY, (currentGuides) => {
        const existing = currentGuides ?? []
        return [newGuide, ...existing.filter((guide) => guide.id !== newGuide.id)]
      })
      await queryClient.invalidateQueries({ queryKey: GUIDES_QUERY_KEY })
    },
  })

  const createGuide = React.useCallback(
    async (values: GuideFormValues): Promise<Guide> => {
      return createMutation.mutateAsync(values)
    },
    [createMutation]
  )

  return {
    createGuide,
    isCreating: createMutation.isPending,
    error: createMutation.error,
  }
}
