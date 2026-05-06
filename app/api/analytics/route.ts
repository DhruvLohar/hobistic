import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"
import { APP_EVENT_VALUES } from "@/src/utils/analytics-events"

type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[]

const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ])
)

const analyticsPayloadSchema = z.object({
  event: z.enum(APP_EVENT_VALUES),
  data: jsonValueSchema.optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const parsed = analyticsPayloadSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 422 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }))

    const { error: insertError } = await supabase.from("analytics_events").insert({
      event: parsed.data.event,
      event_data: parsed.data.data ?? {},
      user_id: user?.id ?? null,
    })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[api/analytics] Error:", err)
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 })
  }
}
