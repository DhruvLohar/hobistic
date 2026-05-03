import type { EngineState } from "../state";
import type { EnrichedGuide, EnrichedSubtopic } from "../types";

export function mergeOutput(
  state: typeof EngineState.State,
): Partial<typeof EngineState.State> {
  const { guide, subtopicResources, curatedSubtopics } = state;

  const resourceMap = new Map(
    subtopicResources.map((r) => [`${r.techniqueIndex}-${r.subtopicIndex}`, r]),
  );
  const curationMap = new Map(
    curatedSubtopics.map((c) => [`${c.techniqueIndex}-${c.subtopicIndex}`, c]),
  );

  const enrichedGuide: EnrichedGuide = {
    hobby: guide.hobby,
    genre: guide.genre,
    techniques: guide.techniques.map((technique, ti) => ({
      title: technique.title,
      subtopics: technique.subtopics.map((sub, si): EnrichedSubtopic => {
        const key = `${ti}-${si}`;
        const resource = resourceMap.get(key);
        const curated = curationMap.get(key);

        return {
          ...sub,
          content: curated?.content ?? `## ${sub.title}\n\n${sub.text}`,
          images: resource?.images ?? [],
          videos: resource?.youtubeVideos ?? [],
        };
      }),
    })),
  };

  console.log(
    `[mergeOutput] Assembled enriched guide with ${enrichedGuide.techniques.length} techniques`,
  );

  return { enrichedGuide };
}
