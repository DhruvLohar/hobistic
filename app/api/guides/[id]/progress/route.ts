import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"

const completeSubtopicSchema = z.object({
  subtopicId: z.string().uuid(),
})

type OrderedSubtopic = {
  id: string
  sort_order: number
}

type OrderedTechnique = {
  id: string
  sort_order: number
  subtopics: OrderedSubtopic[]
}

export async function PATCH(
  req: NextRequest,
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

    const body = await req.json().catch(() => null)
    const parsed = completeSubtopicSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 422 }
      )
    }

    const targetSubtopicId = parsed.data.subtopicId

    const { data: guide, error: guideError } = await supabase
      .from("guides")
      .select(`
        id,
        techniques (
          id, sort_order,
          subtopics (
            id, sort_order
          )
        )
      `)
      .eq("id", guideId)
      .eq("user_id", user.id)
      .single()

    if (guideError || !guide) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 })
    }

    const techniques = ((guide.techniques as OrderedTechnique[]) ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)

    const orderedSubtopicIds = techniques.flatMap((technique) =>
      (technique.subtopics ?? [])
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((subtopic) => subtopic.id)
    )

    const currentIndex = orderedSubtopicIds.findIndex((id) => id === targetSubtopicId)
    if (currentIndex === -1) {
      return NextResponse.json(
        { error: "Subtopic does not belong to this guide" },
        { status: 400 }
      )
    }

    const { data: currentProgress, error: progressError } = await supabase
      .from("guide_subtopic_progress")
      .select("subtopic_id, is_unlocked, is_completed")
      .eq("guide_id", guideId)
      .eq("user_id", user.id)
      .eq("subtopic_id", targetSubtopicId)
      .single()

    if (progressError || !currentProgress) {
      return NextResponse.json(
        { error: "Progress row not found for subtopic" },
        { status: 404 }
      )
    }

    if (!currentProgress.is_unlocked) {
      return NextResponse.json(
        { error: "Subtopic is still locked" },
        { status: 409 }
      )
    }

    const nowIso = new Date().toISOString()
    if (!currentProgress.is_completed) {
      const { error: completeError } = await supabase
        .from("guide_subtopic_progress")
        .update({ is_completed: true, completed_at: nowIso })
        .eq("guide_id", guideId)
        .eq("user_id", user.id)
        .eq("subtopic_id", targetSubtopicId)

      if (completeError) {
        return NextResponse.json({ error: completeError.message }, { status: 500 })
      }
    }

    const nextSubtopicId = orderedSubtopicIds[currentIndex + 1] ?? null

    if (nextSubtopicId) {
      const { error: unlockError } = await supabase
        .from("guide_subtopic_progress")
        .update({ is_unlocked: true, unlocked_at: nowIso })
        .eq("guide_id", guideId)
        .eq("user_id", user.id)
        .eq("subtopic_id", nextSubtopicId)
        .eq("is_unlocked", false)

      if (unlockError) {
        return NextResponse.json({ error: unlockError.message }, { status: 500 })
      }
    }

    const changedIds = [targetSubtopicId]
    if (nextSubtopicId) changedIds.push(nextSubtopicId)

    const { data: changedRows, error: changedError } = await supabase
      .from("guide_subtopic_progress")
      .select("subtopic_id, is_unlocked, is_completed, unlocked_at, completed_at")
      .eq("guide_id", guideId)
      .eq("user_id", user.id)
      .in("subtopic_id", changedIds)

    if (changedError) {
      return NextResponse.json({ error: changedError.message }, { status: 500 })
    }

    return NextResponse.json({
      progress: changedRows ?? [],
      currentSubtopicId: targetSubtopicId,
      nextUnlockedSubtopicId: nextSubtopicId,
    })
  } catch (err) {
    console.error("[api/guides/[id]/progress] Error:", err)
    return NextResponse.json(
      { error: "Failed to update subtopic progress" },
      { status: 500 }
    )
  }
}
