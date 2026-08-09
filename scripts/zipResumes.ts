import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CompressionLevel, createArchive } from "zip-bun";
import { prisma } from "../lib/prisma";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper: Fetch file directly as Uint8Array
async function fetchResumeBuffer(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

// Concurrency helper to limit active network requests
async function mapConcurrent<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  const executing: Promise<void>[] = [];

  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    const e: Promise<void> = p.finally(() => {
      executing.splice(executing.indexOf(e), 1);
    });
    executing.push(e);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
}

async function main() {
  const participants = await prisma.participantInfo.findMany({
    where: { resumeUrl: { not: null } },
    select: {
      resumeUrl: true,
      user: { select: { email: true } },
    },
  });

  console.log(`Found ${participants.length} resumes.`);

  const outputPath = resolve(__dirname, "all-resumes.zip");

  // Initialize native C-based archive writer
  const archive = createArchive(outputPath);

  // Download up to 10 resumes concurrently
  const CONCURRENCY_LIMIT = 10;

  await mapConcurrent(
    participants,
    CONCURRENCY_LIMIT,
    async ({ resumeUrl, user }) => {
      if (!resumeUrl?.trim()) {
        console.warn(`⚠️ Skipping ${user.email}: No valid resume URL`);
        return;
      }

      try {
        const fileName = `${user.email.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
        const fileData = await fetchResumeBuffer(resumeUrl);

        // Native compression step
        archive.addFile(fileName, fileData, CompressionLevel.BEST_COMPRESSION);
        console.log(`✅ Added ${fileName}`);
      } catch (error) {
        console.error(`❌ Failed to add ${user.email}:`, error);
      }
    },
  );

  // Finalize ZIP and write directly to disk
  archive.finalize();
  console.log(`📦 Created ZIP: ${outputPath}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
