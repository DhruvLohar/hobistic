"use client"

import { useQuery } from "@tanstack/react-query"

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
