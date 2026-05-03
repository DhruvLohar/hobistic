import axios from "axios";

const SERPER_IMAGES_URL = "https://google.serper.dev/images";

interface SerperImageResult {
  title: string;
  imageUrl: string;
  link: string;
}

interface SerperImagesResponse {
  images: SerperImageResult[];
}

export async function searchImages(
  keyword: string,
): Promise<string[]> {
  if (!keyword) return [];

  try {
    const { data } = await axios.post<SerperImagesResponse>(
      SERPER_IMAGES_URL,
      { q: keyword, num: 6 },
      {
        headers: {
          "X-API-KEY": process.env.SERPER_API_KEY!,
          "Content-Type": "application/json",
        },
      },
    );

    const images = data.images ?? [];
    if (images.length === 0) return [];

    // shuffle and return 2-3
    const shuffled = images.sort(() => Math.random() - 0.5);
    const count = Math.min(3, Math.max(2, shuffled.length));
    return shuffled.slice(0, count).map((img) => img.imageUrl);
  } catch {
    return [];
  }
}
