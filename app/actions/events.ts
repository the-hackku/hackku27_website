"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth, hasPermissions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import type { EventType } from "@/prisma/generated/client";

export async function fetchEvents() {
  return await prisma.event.findMany({
    select: {
      id: true,
      name: true,
      startDate: true, // ⬅️ add this
    },
    orderBy: {
      startDate: "asc", // ⬅️ optionally sort here instead of the frontend
    },
  });
}

export async function updateEvent(
  id: string,
  data: {
    name: string;
    description: string;
    location: string;
    eventType: EventType;
    startDate: string; // ISO
    endDate: string; // ISO
  },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await hasPermissions(session, { events: ["manage"] });
  await prisma.event.update({
    where: { id },
    data: {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    },
  });

  revalidatePath("/schedule");
}
