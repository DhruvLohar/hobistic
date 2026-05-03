import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const genai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY!,
  httpOptions: { timeout: 120_000 }, // 2 minute timeout (default is 1 min)
});

export const groundingEnabledTools = [
  {
    googleSearch: {},
  },
];

export const GEMINI_FLASH_PREVIEW = "gemini-3.1-flash-lite-preview";
export const GEMINI_PRO_TEXT = "gemini-3.1-pro-preview";

type GenAIModel =
  | "GEMINI_FLASH_PREVIEW"
  | "GEMINI_PRO_TEXT";

const modelMap: Record<GenAIModel, string> = {
  GEMINI_FLASH_PREVIEW,
  GEMINI_PRO_TEXT,
};

export async function useGenAIGrounding(systemPrompt: string, userPrompt: string, model?: GenAIModel): Promise<string>;
export async function useGenAIGrounding<T>(systemPrompt: string, userPrompt: string, model: GenAIModel, schema: any): Promise<T>;
export async function useGenAIGrounding<T>(
  systemPrompt: string,
  userPrompt: string,
  model: GenAIModel = "GEMINI_FLASH_PREVIEW",
  schema?: any // TODO: fix to a type later
): Promise<string | T> {
  const config = {
    thinkingConfig: {
      thinkingLevel: ThinkingLevel.MEDIUM,
    },
    tools: groundingEnabledTools,
    systemInstruction: [
      {
        text: systemPrompt,
      },
    ],
    ...(schema && {
      temperature: 1.0,
      responseMimeType: "application/json" as const,
      responseJsonSchema: schema,
    }),
  };

  const contents = [
    {
      role: "user",
      parts: [
        {
          text: userPrompt,
        },
      ],
    },
  ];

  const response = await genai.models.generateContent({
    model: modelMap[model],
    config,
    contents,
  });

  if (schema) {
    const raw = response.text ?? "";
    console.log(`[GenAI] Raw response (first 500 chars):`, raw.slice(0, 500));
    if (!raw) {
      const finishReason = response.candidates?.[0]?.finishReason;
      const promptFeedback = response.promptFeedback;
      const parts = response.candidates?.[0]?.content?.parts;
      console.error(`[GenAI] Empty response. finishReason=${finishReason}, promptFeedback=${JSON.stringify(promptFeedback)}, parts=${JSON.stringify(parts?.map(p => ({ thought: (p as any).thought, hasText: !!p.text, textLen: p.text?.length })))}`);
    }
    try {
      return JSON.parse(raw) as T;
    } catch (err) {
      console.error(`[GenAI] Failed to parse response. Full text:`, raw);
      throw err;
    }
  }

  return response.text ?? "";
}