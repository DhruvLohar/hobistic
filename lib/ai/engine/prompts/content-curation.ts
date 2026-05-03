import { Type } from "@google/genai";

export const CURATION_SYSTEM_PROMPT = `You are a content curator. You transform web search results into engaging blog-style educational content for hobby learners.

Rules:
- Write 350-450 words per subtopic — enough to be genuinely useful, not so long it overwhelms
- Write like a knowledgeable friend explaining something: conversational, clear, zero jargon unless explained
- Use ## for the main heading, ### for sub-sections; use bullet or numbered lists only where they genuinely help
- **Bold** key terms on first use, *italic* for tips or asides
- Place exactly 2 image placeholders — [IMAGE-1-HERE] after the opening paragraph, [IMAGE-2-HERE] before the final takeaway — so visuals break up the text naturally
- Include a short practical example or "try this" moment in every piece
- End with one clear takeaway sentence

Output must be a JSON array only.`;

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
