"use server";

import { headers } from "next/headers";
import { infoPageContent as infoPageContentTable } from "@/db/schema";
import { auth, hasPermissions } from "@/lib/auth/auth";
import { db } from "@/lib/db";

export async function getInfoPage(): Promise<
  typeof infoPageContentTable.$inferSelect
> {
  return (await db.query.infoPageContent.findFirst({
    where: { id: "singleton" },
  })) as typeof infoPageContentTable.$inferSelect;
}

export async function updateInfoPage(data: {
  title?: string;
  content?: string;
  titleImageUrl?: string | null;
  logoUrl?: string | null;
}): Promise<typeof infoPageContentTable.$inferSelect> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await hasPermissions(session, { info_pages: ["manage"] });

  await db
    .insert(infoPageContentTable)
    .values({ id: "singleton", updatedAt: new Date(), ...data })
    .onConflictDoUpdate({
      target: infoPageContentTable.id,
      set: data,
    });
  return (await db.query.infoPageContent.findFirst({
    where: { id: "singleton" },
  })) as typeof infoPageContentTable.$inferSelect;
}
