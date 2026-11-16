"use server";

import { db } from "@/lib/db";

export async function exportEmails(): Promise<string> {
  try {
    const users = await db.query.user.findMany({
      columns: { email: true },
    });
    return users.map((user) => user.email).join("\n");
  } catch (error) {
    console.error("❌ Error exporting emails:", error);
    return "";
  }
}

export async function exportParticipantEmails(): Promise<string> {
  try {
    const participants = await db.query.user.findMany({
      where: { participantInfo: true },
      columns: { email: true },
    });
    return participants.map((user) => user.email).join("\n");
  } catch (error) {
    console.error("❌ Error exporting participant emails:", error);
    return "";
  }
}

export async function exportUnregisteredEmails(): Promise<string> {
  try {
    const users = await db.query.user.findMany({
      where: {
        participantInfo: true,
      },
      columns: { email: true },
    });
    return users.map((user) => user.email).join("\n");
  } catch (error) {
    console.error("❌ Error exporting unregistered emails:", error);
    return "";
  }
}
