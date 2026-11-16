"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { type EventType, event as eventTable } from "@/db/schema";
import { auth, hasPermissions } from "@/lib/auth/auth";
import { db } from "@/lib/db";

export async function fetchEvents() {
  return await db.query.event.findMany({
    columns: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
    },
    orderBy: { startDate: "asc" },
  });
}

export async function updateEvent(
  id: string,
  data: {
    name: string;
    description: string;
    location: string;
    eventType: EventType;
    startDate: string;
    endDate: string;
  },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await hasPermissions(session, { events: ["manage"] });
  await db
    .update(eventTable)
    .set({
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    })
    .where(eq(eventTable.id, id));

  revalidatePath("/schedule");
}
