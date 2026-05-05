import type { EngineState } from "../state";
import type { SubtopicResources } from "../types";
import { searchWeb } from "../tools/serper";
import { searchImages } from "../tools/image-search";
import { searchYouTube } from "../tools/youtube-search";

const CONCURRENCY_LIMIT = 6;

async function processWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < tasks.length) {
      const idx = nextIndex++;
      results[idx] = await tasks[idx]();
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

export async function processAllSubtopics(
  state: typeof EngineState.State,
): Promise<Partial<typeof EngineState.State>> {
  const { guide } = state;

  const tasks: (() => Promise<SubtopicResources>)[] = [];

  guide.techniques.forEach((technique, ti) => {
    technique.subtopics.forEach((subtopic, si) => {
      tasks.push(async () => {
        const [webContent, images, youtubeVideos] = await Promise.all([
          searchWeb(`${subtopic.text} ${guide.hobby}`),
          searchImages(subtopic.imageKeyword),
          searchYouTube(subtopic.ytKeyword),
        ]);

        console.log(
          `[processSubtopic] Done: ${subtopic.title} — web: ${webContent.length} chars, images: ${images.length}, videos: ${youtubeVideos.length}`,
        );

        return {
          techniqueIndex: ti,
          subtopicIndex: si,
          webContent,
          images,
          youtubeVideos,
        };
      });
    });
  });

  console.log(`[processAllSubtopics] Processing ${tasks.length} subtopics (concurrency: ${CONCURRENCY_LIMIT})`);
  const subtopicResources = await processWithConcurrency(tasks, CONCURRENCY_LIMIT);
  console.log(`[processAllSubtopics] All ${subtopicResources.length} subtopics processed`);

  return { subtopicResources };
}
