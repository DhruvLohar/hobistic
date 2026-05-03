export interface EngineInput {
  hobby: string;
  timePerDay: string;
  reasonOfLearning: string;
  isFirstTime: boolean;
}

export interface Subtopic {
  title: string;
  text: string;
  imageKeyword: string;
  ytKeyword: string;
}

export interface Technique {
  title: string;
  subtopics: Subtopic[];
}

export interface GuideStructure {
  hobby: string;
  genre: string;
  techniques: Technique[];
}

export interface YouTubeVideo {
  title: string;
  url: string;
  thumbnail: string;
}

export interface SubtopicResources {
  techniqueIndex: number;
  subtopicIndex: number;
  webContent: string;
  images: string[];
  youtubeVideos: YouTubeVideo[];
}

export interface CuratedSubtopic {
  title: string;
  content: string;
  techniqueIndex: number;
  subtopicIndex: number;
}

export interface EnrichedSubtopic extends Subtopic {
  content: string;
  images: string[];
  videos: YouTubeVideo[];
}

export interface EnrichedTechnique {
  title: string;
  subtopics: EnrichedSubtopic[];
}

export interface EnrichedGuide {
  hobby: string;
  genre: string;
  techniques: EnrichedTechnique[];
}

export interface ProcessSubtopicInput {
  techniqueIndex: number;
  subtopicIndex: number;
  subtopic: Subtopic;
  hobby: string;
}
