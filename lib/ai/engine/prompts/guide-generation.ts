import { Type } from "@google/genai";
import type { EngineInput } from "../types";

export const GUIDE_SYSTEM_PROMPT = `You are an expert hobby guide creator who builds personalized learning plans.

Your output must be a JSON object with the exact schema provided. Design a practical, progressive path that builds skills step by step.

Structural rules:
- Create 3-5 techniques (major learning areas)
- Each technique should have 3-6 subtopics
- Subtopics must progress from basic to advanced within each technique
- The final subtopic of the entire guide must directly address the learner's stated reason for learning

Title rules:
- All technique and subtopic titles must use simple, everyday English — no jargon, no fancy terms
- Titles should be instantly understandable to a complete beginner (e.g. "How to Hold the Guitar" not "Proper Instrument Ergonomics")

Content quality rules:
- "text" must be a concise, specific description (1-2 sentences) of what the learner will study
- "imageKeyword" must describe exactly what a useful educational photo for THIS subtopic would look like — be specific about the subject, action, and angle. Ask yourself: "what image would a teacher show while explaining this?" Examples:
  - For a subtopic on guitar chord transitions: "guitarist fingers pressing G chord frets close-up"
  - For a subtopic on crochet slip knot: "hands making slip knot with yarn step by step"
  - For a subtopic on watercolor wet-on-wet: "watercolor paint bleeding on wet paper close-up"
  - BAD: "guitar", "crochet", "painting" — these are too generic and return random images
- "ytKeyword" for the final subtopic must be a goal-specific beginner tutorial query — search for the simplest real project the user can make toward their reason (e.g. "easy crochet heart tutorial for beginners" if the reason is crocheting for their girlfriend). For all other subtopics, use a specific instructional search term.

Personalization rules:
- LIFESTYLE: Calibrate pacing and session length to the learner's schedule. A student has flexible time; a working professional needs compact, high-ROI sessions.
- PURPOSE: Shape the guide arc around why they're learning.
  - escape-routine → emphasize flow, playfulness, sensory immersion
  - explore-new → breadth first; surface interesting angles
  - master-skill → depth first; deliberate practice and measurable milestones
  - mental-wellness → calm focus, low-stakes progression, no pressure`;

const LIFESTYLE_LABELS: Record<string, string> = {
  student: "student (flexible schedule, limited budget)",
  working: "full-time professional (evenings/weekends only)",
  business: "business owner (irregular schedule, outcome-driven)",
  "content-creator": "content creator (learning for audience and creation)",
  freelancer: "freelancer (self-directed, project-based mindset)",
  homemaker: "homemaker (home-based, family commitments)",
  retired: "retired (ample time, life experience to draw from)",
};

const PURPOSE_LABELS: Record<string, string> = {
  "escape-routine": "escape daily routine (fun, play, immersion)",
  "explore-new": "explore something new (curiosity, breadth)",
  "master-skill": "master a skill (depth, deliberate practice, milestones)",
  "mental-wellness": "mental wellness (calm, focus, low-pressure progress)",
};

export function buildGuideUserPrompt(input: EngineInput): string {
  const lines: string[] = [
    `Hobby: ${input.hobby}`,
    `Time available per day: ${input.timePerDay} hours`,
    `Reason for learning: ${input.reasonOfLearning}`,
    `First time learner: ${input.isFirstTime ? "Yes" : "No"}`,
  ];

  if (input.lifestyle) {
    lines.push(
      `Learner lifestyle: ${LIFESTYLE_LABELS[input.lifestyle] ?? input.lifestyle}`,
    );
  }

  if (input.purpose) {
    lines.push(
      `Learning purpose: ${PURPOSE_LABELS[input.purpose] ?? input.purpose}`,
    );
  }

  return `Create a personalized hobby learning guide for this learner:

${lines.join("\n")}

The final subtopic of the last technique must be titled and written specifically around "${input.reasonOfLearning}" — showing the learner how to apply everything toward that exact goal. Its ytKeyword must search for the simplest beginner project that delivers that goal directly.

Generate a complete learning plan with techniques and subtopics.`;
}

export const guideJsonSchema = {
  type: Type.OBJECT,
  required: ["hobby", "genre", "techniques"],
  properties: {
    hobby: {
      type: Type.STRING,
    },
    genre: {
      type: Type.STRING,
    },
    techniques: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["title", "subtopics"],
        properties: {
          title: {
            type: Type.STRING,
          },
          subtopics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ["title", "text", "imageKeyword", "ytKeyword"],
              properties: {
                title: {
                  type: Type.STRING,
                },
                text: {
                  type: Type.STRING,
                },
                imageKeyword: {
                  type: Type.STRING,
                },
                ytKeyword: {
                  type: Type.STRING,
                },
              },
            },
          },
        },
      },
    },
  },
};
