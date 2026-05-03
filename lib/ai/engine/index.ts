import { END, START, Send, StateGraph } from "@langchain/langgraph";
import { EngineState } from "./state";
import { generateGuide } from "./nodes/generate-guide";
import { processSubtopic } from "./nodes/process-subtopic";
import { curateContent } from "./nodes/curate-content";
import { mergeOutput } from "./nodes/merge-output";
import type { EngineInput, EnrichedGuide } from "./types";

function fanOutSubtopics(
  state: typeof EngineState.State,
): Send[] {
  const sends: Send[] = [];

  state.guide.techniques.forEach((technique, ti) => {
    technique.subtopics.forEach((subtopic, si) => {
      sends.push(
        new Send("processSubtopic", {
          techniqueIndex: ti,
          subtopicIndex: si,
          subtopic,
          hobby: state.guide.hobby,
        }),
      );
    });
  });

  console.log(`[engine] Fan-out: ${sends.length} subtopics to process`);
  return sends;
}

const workflow = new StateGraph(EngineState)
  .addNode("generateGuide", generateGuide)
  .addNode("processSubtopic", processSubtopic)
  .addNode("curateContent", curateContent)
  .addNode("mergeOutput", mergeOutput)
  .addEdge(START, "generateGuide")
  .addConditionalEdges("generateGuide", fanOutSubtopics)
  .addEdge("processSubtopic", "curateContent")
  .addEdge("curateContent", "mergeOutput")
  .addEdge("mergeOutput", END);

export const engine = workflow.compile();

export async function runEngine(input: EngineInput): Promise<EnrichedGuide> {
  const result = await engine.invoke({ input });
  return result.enrichedGuide;
}

export type { EngineInput, EnrichedGuide } from "./types";
