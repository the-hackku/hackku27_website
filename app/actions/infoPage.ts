"use server";

import { auth, hasPermissions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export type InfoPageData = {
  id: string;
  title: string;
  content: string;
  titleImageUrl: string | null;
  logoUrl: string | null;
  updatedAt: Date;
};

export async function getInfoPage(): Promise<InfoPageData> {
  const page = await prisma.infoPageContent.upsert({
    where: { id: "singleton" },
    create: { id: "singleton" },
    update: {},
  });
  return page;
}

export async function updateInfoPage(data: {
  title?: string;
  content?: string;
  titleImageUrl?: string | null;
  logoUrl?: string | null;
}): Promise<InfoPageData> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  await hasPermissions(session, { info_pages: ["manage"] });

  const page = await prisma.infoPageContent.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });
  return page;
}
