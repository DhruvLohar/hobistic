import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { onboardingSchema } from "@/src/utils/schemas"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = onboardingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 422 }
      )
    }

    const { display_name, hobbies, lifestyle, purpose } = parsed.data

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        display_name,
        hobbies,
        lifestyle,
        purpose,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
