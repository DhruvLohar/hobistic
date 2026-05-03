import { useGenAIGrounding } from "@/lib/ai";
import type { EngineState } from "../state";
import type { GuideStructure } from "../types";
import {
  GUIDE_SYSTEM_PROMPT,
  buildGuideUserPrompt,
  guideJsonSchema,
} from "../prompts/guide-generation";

export async function generateGuide(
  state: typeof EngineState.State,
): Promise<Partial<typeof EngineState.State>> {
  const guide = await useGenAIGrounding<GuideStructure>(
    GUIDE_SYSTEM_PROMPT,
    buildGuideUserPrompt(state.input),
    "GEMINI_PRO_TEXT",
    guideJsonSchema,
  );

  console.log(
    `[generateGuide] Generated guide: ${guide.hobby} (${guide.genre}) with ${guide.techniques.length} techniques`,
  );

  return { guide };
}
