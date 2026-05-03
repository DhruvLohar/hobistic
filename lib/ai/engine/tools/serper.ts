import axios from "axios";

const SERPER_API_URL = "https://google.serper.dev/search";

interface SerperOrganicResult {
  title: string;
  snippet: string;
  link: string;
}

interface SerperSearchResponse {
  organic: SerperOrganicResult[];
}

export async function searchWeb(query: string): Promise<string> {
  try {
    const { data } = await axios.post<SerperSearchResponse>(
      SERPER_API_URL,
      { q: query, num: 5 },
      {
        headers: {
          "X-API-KEY": process.env.SERPER_API_KEY!,
          "Content-Type": "application/json",
        },
      },
    );

    const snippets = (data.organic ?? [])
      .map((r) => `${r.title}: ${r.snippet}`)
      .join("\n\n");

    return snippets || "No results found.";
  } catch {
    return "No content available.";
  }
}
