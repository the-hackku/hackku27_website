import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import RegisterAlert from "./RegisterAlert";

// Async server component — runs after the header chrome is already painted.
// Only renders the register alert; admin/volunteer state could be added here too.
export default async function HeaderUserInfo() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.session.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.session.userId },
    select: { role: true, ParticipantInfo: { select: { id: true } } },
  });

  if (!user) return null;

  const isAdminUser = user.role === "ADMIN";
  const isVolunteerUser = user.role === "VOLUNTEER";
  const isRegistered = Boolean(user.ParticipantInfo);

  if (isRegistered || isAdminUser || isVolunteerUser) return null;

  return <RegisterAlert />;
}
