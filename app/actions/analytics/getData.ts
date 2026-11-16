"use server";

import { db } from "@/lib/db";

const IGNORE_PHRASES = ["none", "no special accommodations", "n/a", "na", "no"];

function cleanText(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "");
}

// Fetch raw dietary restrictions
export async function getDietaryData() {
  const participants = await db.query.participantInfo.findMany({
    columns: { dietaryRestrictions: true },
  });

  return participants.map((p) => cleanText(p.dietaryRestrictions || ""));
}

// Fetch raw accessibility accommodations
export async function getAccessibilityData() {
  const participants = await db.query.participantInfo.findMany({
    columns: { specialAccommodations: true },
  });

  return participants
    .map((p) =>
      cleanText(p.specialAccommodations || "")
        .trim()
        .toLowerCase(),
    )
    .filter((entry) => entry && !IGNORE_PHRASES.includes(entry));
}
