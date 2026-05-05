import axios from "axios";

const SERPER_IMAGES_URL = "https://google.serper.dev/images";
const VALIDATE_TIMEOUT_MS = 2000;

interface SerperImageResult {
  title: string;
  imageUrl: string;
  link: string;
}

interface SerperImagesResponse {
  images: SerperImageResult[];
}

async function isImageReachable(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(VALIDATE_TIMEOUT_MS),
    });
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
      { q: keyword, num: 6 },
      {
        headers: {
          "X-API-KEY": process.env.SERPER_API_KEY!,
          "Content-Type": "application/json",
        },
        timeout: 5000,
      },
    );

    const images = data.images ?? [];
    if (images.length === 0) return [];

    const shuffled = [...images].sort(() => Math.random() - 0.5);
    const checks = await Promise.all(
      shuffled.map(async (img) => ({
        url: img.imageUrl,
        valid: await isImageReachable(img.imageUrl),
      })),
    );

    const valid = checks.filter((c) => c.valid).map((c) => c.url);
    return valid.slice(0, 3);
  } catch {
    return [];
  }
}
