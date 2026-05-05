"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { GuideFormValues } from "@/src/utils/schemas"
import { useAnalytics } from "@/hooks/use-analytics"

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
const MOCK_CREATE_GUIDE = false;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

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
  const { trackEvent } = useAnalytics()

  const createMutation = useMutation<
    Guide,
    Error,
    GuideFormValues,
    { previousGuides: Guide[] | undefined; tempId: string }
  >({
    mutationFn: async (values) => {
      if (MOCK_CREATE_GUIDE) {
        await sleep(4000)

        return {
          id: crypto.randomUUID(),
          hobby: values.hobby,
          genre: "processing",
          status: "processing",
          time_per_day: values.timePerDay,
          reason_of_learning: values.reasonOfLearning,
          is_first_time: values.isFirstTime,
          created_at: new Date().toISOString(),
          subtopic_count: 0,
          cover_image: null,
        }
      }

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
    onMutate: async (values) => {
      await queryClient.cancelQueries({ queryKey: GUIDES_QUERY_KEY })
      const previousGuides = queryClient.getQueryData<Guide[]>(GUIDES_QUERY_KEY)
      const tempId = `temp-${crypto.randomUUID()}`
      const optimisticGuide: Guide = {
        id: tempId,
        hobby: values.hobby,
        genre: "other",
        status: "processing",
        time_per_day: values.timePerDay,
        reason_of_learning: values.reasonOfLearning,
        is_first_time: values.isFirstTime,
        created_at: new Date().toISOString(),
        subtopic_count: 0,
        cover_image: null,
      }
      queryClient.setQueryData<Guide[]>(GUIDES_QUERY_KEY, (current) => [
        optimisticGuide,
        ...(current ?? []),
      ])
      return { previousGuides, tempId }
    },
    onSuccess: async (newGuide, _, context) => {
      trackEvent("HobbyGuideCreated", {
        guideId: newGuide.id,
        hobby: newGuide.hobby,
      })

      queryClient.setQueryData<Guide[]>(GUIDES_QUERY_KEY, (current) => {
        const filtered = (current ?? []).filter((g) => g.id !== context?.tempId)
        return [newGuide, ...filtered.filter((g) => g.id !== newGuide.id)]
      })

      if (!MOCK_CREATE_GUIDE) {
        await queryClient.invalidateQueries({ queryKey: GUIDES_QUERY_KEY })
      }
    },
    onError: (_err, _values, context) => {
      if (context?.previousGuides !== undefined) {
        queryClient.setQueryData<Guide[]>(GUIDES_QUERY_KEY, context.previousGuides)
      }
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
