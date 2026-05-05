import { END, START, StateGraph } from "@langchain/langgraph";
import { EngineState } from "./state";
import { generateGuide } from "./nodes/generate-guide";
import { processAllSubtopics } from "./nodes/process-subtopic";
import { curateContent } from "./nodes/curate-content";
import { mergeOutput } from "./nodes/merge-output";
import type { EngineInput, EnrichedGuide } from "./types";

const workflow = new StateGraph(EngineState)
  .addNode("generateGuide", generateGuide)
  .addNode("processAllSubtopics", processAllSubtopics)
  .addNode("curateContent", curateContent)
  .addNode("mergeOutput", mergeOutput)
  .addEdge(START, "generateGuide")
  .addEdge("generateGuide", "processAllSubtopics")
  .addEdge("processAllSubtopics", "curateContent")
  .addEdge("curateContent", "mergeOutput")
  .addEdge("mergeOutput", END);

export const engine = workflow.compile();

export async function runEngine(input: EngineInput): Promise<EnrichedGuide> {
  const startTime = Date.now();
  const result = await engine.invoke({ input });
  console.log(`[engine] Total execution time: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
  return result.enrichedGuide;
}

export type { EngineInput, EnrichedGuide } from "./types";
