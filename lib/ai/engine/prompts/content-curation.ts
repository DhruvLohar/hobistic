import { Type } from "@google/genai";
import type { EngineInput } from "../types";

export const CURATION_SYSTEM_PROMPT = `You are a content curator who transforms web search results into clear, friendly educational content for hobby beginners.

Rules:
- Write 300-350 words per subtopic — substantive and useful, no padding
- Write like a knowledgeable friend: conversational, plain language, no jargon unless you explain it immediately
- Use ## for the main heading, ### for sub-sections only when needed; use bullet or numbered lists only where they genuinely help
- **Bold** key terms on first use, *italic* for tips or asides
- Place exactly 2 image placeholders — [IMAGE-1-HERE] after the opening paragraph, [IMAGE-2-HERE] before the final takeaway
- Include one short "try this" moment per piece
- End with one clear takeaway sentence

For the FINAL subtopic (the one tied to the learner's goal):
- Include a short block of practical notation, patterns, or starter steps they can use immediately (e.g. crochet stitch abbreviations, guitar chord diagrams, basic recipe ratios — whatever is relevant)
- Frame it as "here's what you can do today" — actionable, not theoretical

Output must be a JSON array only.
- Return exactly one output object for each input object.
- Preserve techniqueIndex and subtopicIndex exactly as provided in the input.
- content must be valid markdown, not HTML and not JSON-escaped markdown.`;

export function buildCurationUserPrompt(
  batch: {
    title: string;
    text: string;
    webContent: string;
    isFinal?: boolean;
    techniqueIndex: number;
    subtopicIndex: number;
  }[],
  input?: Pick<EngineInput, "lifestyle" | "purpose">,
): string {
  const subtopicsJson = JSON.stringify(
    batch.map((b) => ({
      techniqueIndex: b.techniqueIndex,
      subtopicIndex: b.subtopicIndex,
      title: b.title,
      text: b.text,
      web_content: b.webContent.slice(0, 2000),
      is_final_goal_subtopic: b.isFinal ?? false,
    })),
    null,
    2,
  );

  const personalizationLines: string[] = [];

  if (input?.lifestyle) {
    const toneMap: Record<string, string> = {
      student: "Peer-to-peer tone; mention affordable tools and short sessions.",
      working: "Punchy and time-efficient. Every sentence earns its place.",
      business: "Outcome-focused. Connect concepts to results where natural.",
      "content-creator": "Highlight what's visual or shareable about each concept.",
      freelancer: "Self-directed framing. Relate to building skills or a portfolio.",
      homemaker: "Warm, encouraging tone. Practical home-context examples.",
      retired: "Calm, experience-respecting tone. Frame mastery as accessible.",
    };
    const tone = toneMap[input.lifestyle];
    if (tone) personalizationLines.push(`Tone: ${tone}`);
  }

  if (input?.purpose) {
    const purposeMap: Record<string, string> = {
      "escape-routine": "Emphasize the joy and flow this skill offers.",
      "explore-new": "Highlight interesting angles and the fun of discovery.",
      "master-skill": "Include a measurable checkpoint or practice tip.",
      "mental-wellness": "Keep it calm and low-pressure. No stress language.",
    };
    const hint = purposeMap[input.purpose];
    if (hint) personalizationLines.push(`Framing: ${hint}`);
  }

  const personalizationSection =
    personalizationLines.length > 0
      ? `\nPERSONALIZATION (apply to all subtopics):\n${personalizationLines.map((l) => `- ${l}`).join("\n")}\n`
      : "";

  return `Transform these web search results into educational markdown for each subtopic.
${personalizationSection}
For any subtopic where is_final_goal_subtopic is true: include a practical notation block or starter steps the learner can use immediately toward their goal.

INPUT:
${subtopicsJson}

OUTPUT:
JSON array only:
[
  {
    "techniqueIndex": 0,
    "subtopicIndex": 0,
    "title": "<subtopic title>",
    "content": "<markdown content 300-350 words>"
  },
  ...
]`;
}

export const curationJsonSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    required: ["techniqueIndex", "subtopicIndex", "title", "content"],
    properties: {
      techniqueIndex: {
        type: Type.NUMBER,
      },
      subtopicIndex: {
        type: Type.NUMBER,
      },
      title: {
        type: Type.STRING,
      },
      content: {
        type: Type.STRING,
      },
    },
  },
};
