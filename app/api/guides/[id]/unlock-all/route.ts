import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: guideId } = await params
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the guide belongs to this user
    const { data: guide, error: guideError } = await supabase
      .from("guides")
      .select("id")
      .eq("id", guideId)
      .eq("user_id", user.id)
      .single()

    if (guideError || !guide) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 })
    }

    const nowIso = new Date().toISOString()

    const { error: unlockError } = await supabase
      .from("guide_subtopic_progress")
      .update({ is_unlocked: true, unlocked_at: nowIso })
      .eq("guide_id", guideId)
      .eq("user_id", user.id)
      .eq("is_unlocked", false)

    if (unlockError) {
      return NextResponse.json({ error: unlockError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[api/guides/[id]/unlock-all] Error:", err)
    return NextResponse.json(
      { error: "Failed to unlock lessons" },
      { status: 500 }
    )
  }
}
