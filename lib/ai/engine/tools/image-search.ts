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

export async function imageExists(url: string): Promise<boolean> {
  try {
    let res = await fetch(url, { method: "HEAD" });

    if (!res.ok) {
      res = await fetch(url);
    }

    const contentType = res.headers.get("content-type");
    return res.ok && !!contentType?.startsWith("image/");
  } catch {
    return false;
  }
}

export async function searchImages(
  keyword: string,
): Promise<string[]> {
  if (!keyword) return [];

  try {
    const { data } = await axios.post<SerperImagesResponse>(
      SERPER_IMAGES_URL,
      { q: keyword, num: 8 },
      {
        headers: {
          "X-API-KEY": process.env.SERPER_API_KEY!,
          "Content-Type": "application/json",
        },
      },
    );

    const images = data.images ?? [];
    if (images.length === 0) return [];

    const shuffled = [...images].sort(() => Math.random() - 0.5);
    const checks = await Promise.all(
      shuffled.map(async (image) => ({
        url: image.imageUrl,
        exists: await imageExists(image.imageUrl),
      })),
    );

    const validUrls = checks.filter((item) => item.exists).map((item) => item.url);
    if (validUrls.length === 0) return [];

    // shuffle and return 2-3
    const count = Math.min(3, Math.max(2, validUrls.length));
    return validUrls.slice(0, count);
  } catch {
    return [];
  }
}
