import path from "path";

const MAX_DOODLES = 10;
const DOODLES_DIR = path.join(process.cwd(), "public/images/doodles");
const doodleGlob = new Bun.Glob("**/*.{png,jpg,jpeg,svg,webp}");

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getDoodleImages(): string[] {
  const candidates: string[] = [];

  try {
    for (const file of doodleGlob.scanSync({ cwd: DOODLES_DIR })) {
      // Split path segments to URL-encode directory names and filenames safely
      const encodedPath = file
        .split(/[/\\]/)
        .map(encodeURIComponent)
        .join("/");

      candidates.push(`/images/doodles/${encodedPath}`);
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
