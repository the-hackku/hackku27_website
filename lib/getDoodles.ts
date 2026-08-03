import fs from "node:fs";
import path from "node:path";
import { unstable_cache } from "next/cache";

const MAX_DOODLES = 10;
const DOODLES_DIR = path.join(process.cwd(), "public/images/doodles");
const IMAGE_EXT = /\.(png|jpg|jpeg|svg|webp)$/i;

function loadDoodleImages(): string[] {
  const candidates: string[] = [];

  try {
    const entries = fs.readdirSync(DOODLES_DIR, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subDir = path.join(DOODLES_DIR, entry.name);
        const subFiles = fs
          .readdirSync(subDir)
          .filter((f) => IMAGE_EXT.test(f));

        for (const file of subFiles) {
          candidates.push(
            `/images/doodles/${encodeURIComponent(entry.name)}/${encodeURIComponent(file)}`,
          );
        }
      } else if (IMAGE_EXT.test(entry.name)) {
        candidates.push(`/images/doodles/${encodeURIComponent(entry.name)}`);
      }
    }
  } catch {
    return [];
  }

  return candidates.slice(0, MAX_DOODLES).sort();
}

export const getDoodleImages = unstable_cache(
  // biome-ignore lint/suspicious/useAwait: Must be async to satisfy unstable_cache signature
  async () => {
    return loadDoodleImages();
  },
  ["doodle-images"],
  {
    revalidate: false,
  },
);
