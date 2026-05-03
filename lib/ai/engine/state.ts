import { Annotation } from "@langchain/langgraph";
import type {
  EngineInput,
  GuideStructure,
  SubtopicResources,
  CuratedSubtopic,
  EnrichedGuide,
} from "./types";

export const EngineState = Annotation.Root({
  input: Annotation<EngineInput>,
  guide: Annotation<GuideStructure>,
  subtopicResources: Annotation<SubtopicResources[]>({
    reducer: (current, update) => (current ?? []).concat(update),
    default: () => [],
  }),
  curatedSubtopics: Annotation<CuratedSubtopic[]>({
    reducer: (current, update) => (current ?? []).concat(update),
    default: () => [],
  }),
  enrichedGuide: Annotation<EnrichedGuide>,
});
