import axios from "axios";
import type { YouTubeVideo } from "../types";

const SERPER_VIDEOS_URL = "https://google.serper.dev/videos";

interface SerperVideoResult {
  title: string;
  link: string;
  imageUrl?: string;
}

interface SerperVideosResponse {
  videos: SerperVideoResult[];
}

export async function searchYouTube(
  keyword: string,
): Promise<YouTubeVideo[]> {
  if (!keyword) return [];

  try {
    const { data } = await axios.post<SerperVideosResponse>(
      SERPER_VIDEOS_URL,
      { q: keyword, num: 3 },
      {
        headers: {
          "X-API-KEY": process.env.NEXT_PUBLIC_SERPER_API_KEY!,
          "Content-Type": "application/json",
        },
      },
    );

    return (data.videos ?? []).map((v) => ({
      title: v.title,
      url: v.link,
      thumbnail: v.imageUrl ?? "",
    }));
  } catch {
    return [];
  }
}
