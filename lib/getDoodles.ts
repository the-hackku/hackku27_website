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
        // Pick ONE random image from the subfolder
        const subDir = path.join(DOODLES_DIR, entry.name);
        const subFiles = fs
          .readdirSync(subDir)
          .filter((f) => IMAGE_EXT.test(f));
        if (subFiles.length > 0) {
          candidates.push(`/images/doodles/${entry.name}/${randomItem(subFiles)}`);
        }
      } else if (IMAGE_EXT.test(entry.name)) {
        // Use every direct image file
        candidates.push(`/images/doodles/${entry.name}`);
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
