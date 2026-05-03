import type { ProcessSubtopicInput, SubtopicResources } from "../types";
import { searchWeb } from "../tools/serper";
import { searchImages } from "../tools/image-search";
import { searchYouTube } from "../tools/youtube-search";

export async function processSubtopic(
  input: ProcessSubtopicInput,
): Promise<{ subtopicResources: SubtopicResources[] }> {
  const { techniqueIndex, subtopicIndex, subtopic, hobby } = input;

  console.log(
    `[processSubtopic] Processing: ${subtopic.title} (technique ${techniqueIndex}, subtopic ${subtopicIndex})`,
  );

  const [webContent, images, youtubeVideos] = await Promise.all([
    searchWeb(`${subtopic.text} ${hobby}`),
    searchImages(subtopic.imageKeyword),
    searchYouTube(subtopic.ytKeyword),
  ]);

  console.log(
    `[processSubtopic] Done: ${subtopic.title} — web: ${webContent.length} chars, images: ${images.length}, videos: ${youtubeVideos.length}`,
  );

  return {
    subtopicResources: [
      {
        techniqueIndex,
        subtopicIndex,
        webContent,
        images,
        youtubeVideos,
      },
    ],
  };
}
