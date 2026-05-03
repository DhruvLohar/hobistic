import { NextRequest, NextResponse } from "next/server";
import { runEngine } from "@/lib/ai/engine";
import type { EngineInput } from "@/lib/ai/engine/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as EngineInput;

    if (!body.hobby || !body.timePerDay || !body.reasonOfLearning) {
      return NextResponse.json(
        { error: "Missing required fields: hobby, timePerDay, reasonOfLearning" },
        { status: 400 },
      );
    }

    const guide = await runEngine({
      hobby: body.hobby,
      timePerDay: body.timePerDay,
      reasonOfLearning: body.reasonOfLearning,
      isFirstTime: body.isFirstTime ?? true,
    });

    return NextResponse.json(guide);
  } catch (err) {
    console.error("[api/engine] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate hobby guide" },
      { status: 500 },
    );
  }
}
