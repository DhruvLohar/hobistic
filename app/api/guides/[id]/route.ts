import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: guide, error } = await supabase
      .from("guides")
      .select(`
        id, hobby, genre, status, time_per_day, reason_of_learning, is_first_time, created_at,
        techniques (
          id, title, sort_order,
          subtopics (
            id, title, text, image_keyword, yt_keyword, content, sort_order,
            subtopic_images ( id, url, sort_order ),
            subtopic_videos ( id, title, url, thumbnail ),
            guide_subtopic_progress ( is_unlocked, is_completed, unlocked_at, completed_at )
          )
        )
      `)
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (error || !guide) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 })
    }

    type ProgressRow = {
      is_unlocked: boolean
      is_completed: boolean
      unlocked_at: string | null
      completed_at: string | null
    }
    type SubtopicRow = {
      id: string
      title: string
      text: string
      image_keyword: string
      yt_keyword: string
      content: string
      sort_order: number
      subtopic_images: { id: string; url: string; sort_order: number }[]
      subtopic_videos: { id: string; title: string; url: string; thumbnail: string }[]
      guide_subtopic_progress?: ProgressRow[]
    }
    type TechniqueRow = {
      id: string
      title: string
      sort_order: number
      subtopics: SubtopicRow[]
    }

    const techniques = ((guide.techniques as TechniqueRow[]) ?? []).map((technique) => ({
      ...technique,
      subtopics: (technique.subtopics ?? []).map((subtopic) => {
        const progress = subtopic.guide_subtopic_progress?.[0]
        return {
          id: subtopic.id,
          title: subtopic.title,
          text: subtopic.text,
          image_keyword: subtopic.image_keyword,
          yt_keyword: subtopic.yt_keyword,
          content: subtopic.content,
          sort_order: subtopic.sort_order,
          subtopic_images: subtopic.subtopic_images ?? [],
          subtopic_videos: subtopic.subtopic_videos ?? [],
          is_unlocked: progress?.is_unlocked ?? false,
          is_completed: progress?.is_completed ?? false,
          unlocked_at: progress?.unlocked_at ?? null,
          completed_at: progress?.completed_at ?? null,
        }
      }),
    }))

    return NextResponse.json({
      guide: {
        ...guide,
        techniques,
      },
    })
  } catch (err) {
    console.error("[api/guides/[id]] Error:", err)
    return NextResponse.json({ error: "Failed to fetch guide" }, { status: 500 })
  }
}
