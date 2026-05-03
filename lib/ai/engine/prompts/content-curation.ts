import { Type } from "@google/genai";

export const CURATION_SYSTEM_PROMPT = `You are a content curator. You transform web search results into educational markdown for hobby learners.

Rules:
- Create well-structured markdown content (200-250 words) per subtopic
- Use clear headings (##, ###), bullet/numbered lists
- **Bold** key terms, *italic* for emphasis
- Keep a beginner-friendly, instructional tone
- Break complex concepts into digestible sections
- Include practical examples where possible
- Stay focused on the subtopic

Output must be a JSON array only, no markdown wrapper.`;

export function buildCurationUserPrompt(
  batch: { title: string; text: string; webContent: string }[],
): string {
  const subtopicsJson = JSON.stringify(
    batch.map((b) => ({
      title: b.title,
      text: b.text,
      web_content: b.webContent.slice(0, 2000),
    })),
    null,
    2,
  );

  return `Transform these web search results into educational markdown for each subtopic.

INPUT (JSON array of subtopics with web content):
${subtopicsJson}

OUTPUT:
JSON array only:
[
  {
    "title": "<subtopic title>",
    "content": "<markdown content 200-250 words>"
  },
  ...
]`;
}

export const curationJsonSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    required: ["title", "content"],
    properties: {
      title: {
        type: Type.STRING,
      },
      content: {
        type: Type.STRING,
      },
    },
  },
};
