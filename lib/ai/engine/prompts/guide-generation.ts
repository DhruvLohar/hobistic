import { Type } from "@google/genai";
import type { EngineInput } from "../types";

export const GUIDE_SYSTEM_PROMPT = `You are an expert hobby guide creator. You design structured, beginner-friendly learning plans for any hobby.

Your output must be a JSON object with the exact schema provided. Focus on creating a practical, progressive learning path that builds skills incrementally.

Guidelines:
- Create 3-5 techniques (major learning areas)
- Each technique should have 3-6 subtopics
- Subtopics should progress from basic to advanced within each technique
- The final subtopic of the entire guide must directly address the learner's stated reason for learning — it should show how the skills they just built apply to that specific goal
- "text" should be a concise description (1-2 sentences) of what the learner will study
- "imageKeyword" should be a specific search term for finding a relevant educational image
- "ytKeyword" should be a specific search term for finding a relevant tutorial video`;

export function buildGuideUserPrompt(input: EngineInput): string {
  return `Create a structured hobby learning guide with the following details:

Hobby: ${input.hobby}
Time available per day: ${input.timePerDay} hours
Reason for learning: ${input.reasonOfLearning}
First time learner: ${input.isFirstTime ? "Yes" : "No"}

The final subtopic of the last technique must be titled and written specifically around "${input.reasonOfLearning}" — showing the learner how to apply everything they've learned toward that exact goal.

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
