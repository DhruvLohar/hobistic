"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export interface SubtopicImage {
  id: string
  url: string
  sort_order: number
}

export interface SubtopicVideo {
  id: string
  title: string
  url: string
  thumbnail: string
}

export interface Subtopic {
  id: string
  title: string
  text: string
  image_keyword: string
  yt_keyword: string
  content: string
  sort_order: number
  is_unlocked: boolean
  is_completed: boolean
  unlocked_at: string | null
  completed_at: string | null
  subtopic_images: SubtopicImage[]
  subtopic_videos: SubtopicVideo[]
}

export interface Technique {
  id: string
  title: string
  sort_order: number
  subtopics: Subtopic[]
}

export interface GuideDetail {
  id: string
  hobby: string
  genre: string
  status: "processing" | "completed"
  time_per_day: string
  reason_of_learning: string
  is_first_time: boolean
  created_at: string
  techniques: Technique[]
}

const GUIDE_DETAIL_QUERY_KEY = "guide-detail"

export function useGuideDetail(id: string) {
  const query = useQuery<GuideDetail, Error>({
    queryKey: [GUIDE_DETAIL_QUERY_KEY, id],
    queryFn: async () => {
      const res = await fetch(`/api/guides/${id}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Failed to fetch guide")
      }
      const data = await res.json()
      return data.guide as GuideDetail
    },
    enabled: !!id,
  })

  return {
    guide: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
  }
}

interface CompleteSubtopicInput {
  guideId: string
  subtopicId: string
}

interface ProgressRow {
  subtopic_id: string
  is_unlocked: boolean
  is_completed: boolean
  unlocked_at: string | null
  completed_at: string | null
}

interface CompleteSubtopicResponse {
  progress: ProgressRow[]
  currentSubtopicId: string
  nextUnlockedSubtopicId: string | null
}

export function useCompleteSubtopic() {
  const queryClient = useQueryClient()

  const mutation = useMutation<
    CompleteSubtopicResponse,
    Error,
    CompleteSubtopicInput
  >({
    mutationFn: async ({ guideId, subtopicId }) => {
      const res = await fetch(`/api/guides/${guideId}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subtopicId }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Failed to complete subtopic")
      }

      return (await res.json()) as CompleteSubtopicResponse
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: [GUIDE_DETAIL_QUERY_KEY, variables.guideId],
      })
    },
  })

  const completeSubtopic = React.useCallback(
    async (input: CompleteSubtopicInput) => mutation.mutateAsync(input),
    [mutation]
  )

  return {
    completeSubtopic,
    isCompleting: mutation.isPending,
    error: mutation.error,
  }
}

export function useUnlockAllLessons() {
  const queryClient = useQueryClient()

  const mutation = useMutation<void, Error, string>({
    mutationFn: async (guideId: string) => {
      const res = await fetch(`/api/guides/${guideId}/unlock-all`, {
        method: "POST",
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Failed to unlock lessons")
      }
    },
    onSuccess: async (_data, guideId) => {
      await queryClient.invalidateQueries({
        queryKey: [GUIDE_DETAIL_QUERY_KEY, guideId],
      })
    },
  })

  const unlockAll = React.useCallback(
    (guideId: string) => mutation.mutateAsync(guideId),
    [mutation]
  )

  return {
    unlockAll,
    isUnlocking: mutation.isPending,
    error: mutation.error,
  }
}
