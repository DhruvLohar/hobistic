import { useGenAIGrounding } from "@/lib/ai";
import type { EngineState } from "../state";
import type { CuratedSubtopic } from "../types";
import {
  CURATION_SYSTEM_PROMPT,
  buildCurationUserPrompt,
  curationJsonSchema,
} from "../prompts/content-curation";

const BATCH_SIZE = 8;

export async function curateContent(
  state: typeof EngineState.State,
): Promise<Partial<typeof EngineState.State>> {
  const { guide, subtopicResources } = state;

  const resourceMap = new Map(
    subtopicResources.map((r) => [`${r.techniqueIndex}-${r.subtopicIndex}`, r]),
  );

  const allItems: {
    title: string;
    text: string;
    webContent: string;
    techniqueIndex: number;
    subtopicIndex: number;
  }[] = [];

  for (let ti = 0; ti < guide.techniques.length; ti++) {
    const technique = guide.techniques[ti];
    for (let si = 0; si < technique.subtopics.length; si++) {
      const sub = technique.subtopics[si];
      const resource = resourceMap.get(`${ti}-${si}`);
      allItems.push({
        title: sub.title,
        text: sub.text,
        webContent: resource?.webContent ?? "",
        techniqueIndex: ti,
        subtopicIndex: si,
      });
    }
  }

  const batches: (typeof allItems)[] = [];
  for (let i = 0; i < allItems.length; i += BATCH_SIZE) {
    batches.push(allItems.slice(i, i + BATCH_SIZE));
  }

  console.log(
    `[curateContent] Curating ${allItems.length} subtopics in ${batches.length} batches`,
  );

  const batchResults = await Promise.all(
    batches.map(async (batch, batchIdx) => {
      try {
        const result = await useGenAIGrounding<
          { title: string; content: string }[]
        >(
          CURATION_SYSTEM_PROMPT,
          buildCurationUserPrompt(batch),
          "GEMINI_FLASH_PREVIEW",
          curationJsonSchema,
        );

        console.log(
          `[curateContent] Batch ${batchIdx + 1}/${batches.length}: curated ${result.length} subtopics`,
        );

        return result.map(
          (r, idx): CuratedSubtopic => ({
            title: r.title,
            content: r.content,
            techniqueIndex: batch[idx].techniqueIndex,
            subtopicIndex: batch[idx].subtopicIndex,
          }),
        );
      } catch (err) {
        console.error(
          `[curateContent] Batch ${batchIdx + 1} failed:`,
          err,
        );
        return batch.map(
          (item): CuratedSubtopic => ({
            title: item.title,
            content: `## ${item.title}\n\n${item.text}`,
            techniqueIndex: item.techniqueIndex,
            subtopicIndex: item.subtopicIndex,
          }),
        );
      }
    }),
  );

  const curatedSubtopics = batchResults.flat();

  console.log(
    `[curateContent] Total curated: ${curatedSubtopics.length} subtopics`,
  );

  return { curatedSubtopics };
}
