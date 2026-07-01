import fs from "fs";
import path from "path";

const MAX_DOODLES = 10;
const DOODLES_DIR = path.join(process.cwd(), "public/images/doodles");
const IMAGE_EXT = /\.(png|jpg|jpeg|svg|webp)$/i;

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getDoodleImages(): string[] {
  const candidates: string[] = [];

  try {
    const entries = fs.readdirSync(DOODLES_DIR, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        // Use ALL images from subfolders
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

  // Shuffle and cap at MAX_DOODLES
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  return candidates.slice(0, MAX_DOODLES);
}
