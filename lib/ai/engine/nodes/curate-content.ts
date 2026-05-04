import { useGenAIGrounding } from "@/lib/ai";
import type { EngineState } from "../state";
import type { CuratedSubtopic } from "../types";
import {
  CURATION_SYSTEM_PROMPT,
  buildCurationUserPrompt,
  curationJsonSchema,
} from "../prompts/content-curation";

const BATCH_SIZE = 4;
const MIN_CONTENT_LENGTH = 200;

type CurationBatchItem = {
  title: string;
  text: string;
  webContent: string;
  isFinal: boolean;
  techniqueIndex: number;
  subtopicIndex: number;
};

type CurationModelItem = {
  techniqueIndex: number;
  subtopicIndex: number;
  title: string;
  content: string;
};

function buildFallbackMarkdown(item: CurationBatchItem): string {
  return `## ${item.title}

${item.text}

[IMAGE-1-HERE]

### Try this
Practice this subtopic for 10-15 focused minutes and note one thing that improved.

[IMAGE-2-HERE]

**Takeaway:** Small, consistent reps make this concept click faster.`;
}

function normalizeMarkdown(title: string, content: string): string {
  const trimmed = content.trim();
  let markdown = trimmed.length > 0 ? trimmed : `## ${title}`;

  if (!markdown.startsWith("#")) {
    markdown = `## ${title}\n\n${markdown}`;
  }

  const fenceCount = (markdown.match(/```/g) ?? []).length;
  if (fenceCount % 2 !== 0) {
    markdown = `${markdown}\n\`\`\``;
  }

  return markdown;
}

export async function curateContent(
  state: typeof EngineState.State,
): Promise<Partial<typeof EngineState.State>> {
  const { guide, subtopicResources } = state;

  const resourceMap = new Map(
    subtopicResources.map((r) => [`${r.techniqueIndex}-${r.subtopicIndex}`, r]),
  );

  const lastTi = guide.techniques.length - 1;
  const lastSi = guide.techniques[lastTi]?.subtopics.length - 1;

  const allItems: CurationBatchItem[] = [];

  for (let ti = 0; ti < guide.techniques.length; ti++) {
    const technique = guide.techniques[ti];
    for (let si = 0; si < technique.subtopics.length; si++) {
      const sub = technique.subtopics[si];
      const resource = resourceMap.get(`${ti}-${si}`);
      allItems.push({
        title: sub.title,
        text: sub.text,
        webContent: resource?.webContent ?? "",
        isFinal: ti === lastTi && si === lastSi,
        techniqueIndex: ti,
        subtopicIndex: si,
      });
    }
  }

  const batches: CurationBatchItem[][] = [];
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
          CurationModelItem[]
        >(
          CURATION_SYSTEM_PROMPT,
          buildCurationUserPrompt(batch, {
            lifestyle: state.input.lifestyle,
            purpose: state.input.purpose,
          }),
          "GEMINI_FLASH_PREVIEW",
          curationJsonSchema,
        );

        console.log(
          `[curateContent] Batch ${batchIdx + 1}/${batches.length}: curated ${result.length} subtopics`,
        );

        const modelByKey = new Map(
          result.map((item) => [
            `${item.techniqueIndex}-${item.subtopicIndex}`,
            item,
          ]),
        );

        return batch.map((item): CuratedSubtopic => {
          const key = `${item.techniqueIndex}-${item.subtopicIndex}`;
          const generated = modelByKey.get(key);
          const normalized = normalizeMarkdown(
            generated?.title ?? item.title,
            generated?.content ?? "",
          );

          const safeContent =
            normalized.length >= MIN_CONTENT_LENGTH
              ? normalized
              : buildFallbackMarkdown(item);

          return {
            title: generated?.title ?? item.title,
            content: safeContent,
            techniqueIndex: item.techniqueIndex,
            subtopicIndex: item.subtopicIndex,
          };
        });
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
