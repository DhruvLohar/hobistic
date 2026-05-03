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
            subtopic_videos ( id, title, url, thumbnail )
          )
        )
      `)
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (error || !guide) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 })
    }

    return NextResponse.json({ guide })
  } catch (err) {
    console.error("[api/guides/[id]] Error:", err)
    return NextResponse.json({ error: "Failed to fetch guide" }, { status: 500 })
  }
}
