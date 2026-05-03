import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

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
      .select("id, hobby, genre, time_per_day, reason_of_learning, is_first_time, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ guides: guides ?? [] })
  } catch (err) {
    console.error("[api/guides] Error:", err)
    return NextResponse.json({ error: "Failed to fetch guides" }, { status: 500 })
  }
}
