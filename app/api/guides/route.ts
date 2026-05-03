import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"
import { runEngine, type EngineInput, type EnrichedGuide } from "@/lib/ai/engine"
import { guideFormSchema } from "@/src/utils/schemas"

const enrichedGuideSchema = z.object({
  hobby: z.string().min(1),
  genre: z.string().min(1),
  techniques: z.array(
    z.object({
      title: z.string().min(1),
      subtopics: z.array(
        z.object({
          title: z.string().min(1),
          text: z.string().min(1),
          imageKeyword: z.string().default(""),
          ytKeyword: z.string().default(""),
          content: z.string().min(1),
          images: z.array(z.string()),
          videos: z.array(
            z.object({
              title: z.string().min(1),
              url: z.string().url(),
              thumbnail: z.string().default(""),
            })
          ),
        })
      ),
    })
  ),
})

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return "Unknown error"
}

async function runGuideEngineJob({
  supabase,
  guideId,
  input,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  guideId: string
  input: EngineInput
}) {
  try {
    const engineResult = await runEngine(input)
    const validatedResult = enrichedGuideSchema.safeParse(engineResult)

    if (!validatedResult.success) {
      throw new Error("Engine output did not match expected guide structure")
    }

    await persistGuideOutput({
      supabase,
      guideId,
      result: validatedResult.data,
    })
  } catch (error) {
    const { error: guideFailError } = await supabase
      .from("guides")
      .update({ status: "processing" })
      .eq("id", guideId)

    if (guideFailError) {
      console.error("[api/guides] Failed to keep guide in processing state:", guideFailError)
    }
    console.error("[api/guides] Engine processing failed:", getErrorMessage(error))
  }
}

async function persistGuideOutput({
  supabase,
  guideId,
  result,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  guideId: string
  result: EnrichedGuide
}) {
  const { error: guideUpdateError } = await supabase
    .from("guides")
    .update({
      hobby: result.hobby,
      genre: result.genre,
      status: "completed",
    })
    .eq("id", guideId)

  if (guideUpdateError) {
    throw new Error(guideUpdateError.message)
  }

  const techniquePayload = result.techniques.map((technique, index) => ({
    guide_id: guideId,
    title: technique.title,
    sort_order: index,
  }))

  const { data: insertedTechniques, error: techniqueError } = await supabase
    .from("techniques")
    .insert(techniquePayload)
    .select("id, sort_order")

  if (techniqueError) {
    throw new Error(techniqueError.message)
  }

  const sortedTechniques = (insertedTechniques ?? []).sort(
    (a, b) => a.sort_order - b.sort_order
  )

  for (const [techniqueIndex, technique] of result.techniques.entries()) {
    const techniqueRow = sortedTechniques[techniqueIndex]
    if (!techniqueRow) {
      throw new Error(`Missing inserted technique at index ${techniqueIndex}`)
    }

    const subtopicPayload = technique.subtopics.map((subtopic, subtopicIndex) => ({
      technique_id: techniqueRow.id,
      title: subtopic.title,
      text: subtopic.text,
      image_keyword: subtopic.imageKeyword,
      yt_keyword: subtopic.ytKeyword,
      content: subtopic.content,
      sort_order: subtopicIndex,
    }))

    const { data: insertedSubtopics, error: subtopicError } = await supabase
      .from("subtopics")
      .insert(subtopicPayload)
      .select("id, sort_order")

    if (subtopicError) {
      throw new Error(subtopicError.message)
    }

    const sortedSubtopics = (insertedSubtopics ?? []).sort(
      (a, b) => a.sort_order - b.sort_order
    )

    const imageRows: { subtopic_id: string; url: string; sort_order: number }[] = []
    const videoRows: { subtopic_id: string; title: string; url: string; thumbnail: string }[] = []

    for (const [subtopicIndex, subtopic] of technique.subtopics.entries()) {
      const subtopicRow = sortedSubtopics[subtopicIndex]
      if (!subtopicRow) {
        throw new Error(
          `Missing inserted subtopic at technique=${techniqueIndex}, subtopic=${subtopicIndex}`
        )
      }

      subtopic.images.forEach((imageUrl, imageIndex) => {
        imageRows.push({
          subtopic_id: subtopicRow.id,
          url: imageUrl,
          sort_order: imageIndex,
        })
      })

      subtopic.videos.forEach((video) => {
        videoRows.push({
          subtopic_id: subtopicRow.id,
          title: video.title,
          url: video.url,
          thumbnail: video.thumbnail,
        })
      })
    }

    if (imageRows.length > 0) {
      const { error: imagesError } = await supabase.from("subtopic_images").insert(imageRows)
      if (imagesError) {
        throw new Error(imagesError.message)
      }
    }

    if (videoRows.length > 0) {
      const { error: videosError } = await supabase.from("subtopic_videos").insert(videoRows)
      if (videosError) {
        throw new Error(videosError.message)
      }
    }
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: guides, error } = await supabase
      .from("guides")
      .select(`
        id, hobby, genre, status, time_per_day, reason_of_learning, is_first_time, created_at,
        techniques (
          subtopics (
            id,
            sort_order,
            subtopic_images ( url, sort_order )
          )
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    type SubtopicImage = { url: string; sort_order: number }
    type Subtopic = { id: string; sort_order: number; subtopic_images: SubtopicImage[] }
    type Technique = { subtopics: Subtopic[] }

    const shaped = (guides ?? []).map((guide) => {
      const techniques: Technique[] = (guide.techniques as Technique[]) ?? []

      const subtopicCount = techniques.reduce((sum, t) => sum + (t.subtopics?.length ?? 0), 0)

      const firstSubtopic = techniques[0]?.subtopics
        ?.slice()
        .sort((a, b) => a.sort_order - b.sort_order)[0]

      const coverImage =
        firstSubtopic?.subtopic_images
          ?.slice()
          .sort((a, b) => a.sort_order - b.sort_order)[0]?.url ?? null

      return {
        id: guide.id,
        hobby: guide.hobby,
        genre: guide.genre,
        status: guide.status,
        time_per_day: guide.time_per_day,
        reason_of_learning: guide.reason_of_learning,
        is_first_time: guide.is_first_time,
        created_at: guide.created_at,
        subtopic_count: subtopicCount,
        cover_image: coverImage,
      }
    })

    return NextResponse.json({ guides: shaped })
  } catch (err) {
    console.error("[api/guides] Error:", err)
    return NextResponse.json({ error: "Failed to fetch guides" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = guideFormSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const input: EngineInput = {
    hobby: parsed.data.hobby,
    timePerDay: parsed.data.timePerDay,
    reasonOfLearning: parsed.data.reasonOfLearning,
    isFirstTime: parsed.data.isFirstTime,
  }

  const { data: createdGuide, error: guideCreateError } = await supabase
    .from("guides")
    .insert({
      user_id: user.id,
      hobby: input.hobby,
      genre: "processing",
      time_per_day: input.timePerDay,
      reason_of_learning: input.reasonOfLearning,
      is_first_time: input.isFirstTime,
      status: "processing",
    })
    .select("id, hobby, genre, status, time_per_day, reason_of_learning, is_first_time, created_at")
    .single()

  if (guideCreateError || !createdGuide) {
    return NextResponse.json(
      { error: guideCreateError?.message ?? "Failed to create guide" },
      { status: 500 }
    )
  }

  try {
    await runGuideEngineJob({
      supabase,
      guideId: createdGuide.id,
      input,
    })
  } catch (engineErr) {
    console.error("[api/guides] Engine failed:", getErrorMessage(engineErr))
    return NextResponse.json(
      {
        guideId: createdGuide.id,
        status: "failed",
        guide: {
          ...createdGuide,
          subtopic_count: 0,
          cover_image: null,
        },
      },
      { status: 201 }
    )
  }

  const { data: completedGuide } = await supabase
    .from("guides")
    .select(`
      id, hobby, genre, status, time_per_day, reason_of_learning, is_first_time, created_at,
      techniques (
        subtopics (
          id,
          sort_order,
          subtopic_images ( url, sort_order )
        )
      )
    `)
    .eq("id", createdGuide.id)
    .single()

  type SubtopicImage = { url: string; sort_order: number }
  type SubtopicRow = { id: string; sort_order: number; subtopic_images: SubtopicImage[] }
  type TechniqueRow = { subtopics: SubtopicRow[] }

  const techniques: TechniqueRow[] = (completedGuide?.techniques as TechniqueRow[]) ?? []
  const subtopicCount = techniques.reduce((sum, t) => sum + (t.subtopics?.length ?? 0), 0)
  const firstSubtopic = techniques[0]?.subtopics
    ?.slice()
    .sort((a, b) => a.sort_order - b.sort_order)[0]
  const coverImage =
    firstSubtopic?.subtopic_images
      ?.slice()
      .sort((a, b) => a.sort_order - b.sort_order)[0]?.url ?? null

  return NextResponse.json(
    {
      guideId: createdGuide.id,
      status: "completed",
      guide: {
        id: completedGuide?.id ?? createdGuide.id,
        hobby: completedGuide?.hobby ?? createdGuide.hobby,
        genre: completedGuide?.genre ?? createdGuide.genre,
        status: completedGuide?.status ?? "completed",
        time_per_day: completedGuide?.time_per_day ?? createdGuide.time_per_day,
        reason_of_learning: completedGuide?.reason_of_learning ?? createdGuide.reason_of_learning,
        is_first_time: completedGuide?.is_first_time ?? createdGuide.is_first_time,
        created_at: completedGuide?.created_at ?? createdGuide.created_at,
        subtopic_count: subtopicCount,
        cover_image: coverImage,
      },
    },
    { status: 201 }
  )
}
