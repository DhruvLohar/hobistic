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
): Promise<string | null> {
  if (!keyword) return null;

  try {
    const { data } = await axios.post<SerperImagesResponse>(
      SERPER_IMAGES_URL,
      { q: keyword, num: 5 },
      {
        headers: {
          "X-API-KEY": process.env.SERPER_API_KEY!,
          "Content-Type": "application/json",
        },
      },
    );

    const images = data.images ?? [];
    if (images.length === 0) return null;

    const randomIdx = Math.floor(Math.random() * images.length);
    return images[randomIdx].imageUrl;
  } catch {
    return null;
  }
}
