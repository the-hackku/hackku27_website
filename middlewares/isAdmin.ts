import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export async function isAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.session.role !== "ADMIN") {
    throw new Error("You are not authorized to perform this action.");
  }

  return session;
}

export async function isAdminOrVolunteer() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (
    !session ||
    !(session.session.role == "ADMIN" || session.session.role == "VOLUNTEER")
  ) {
    throw new Error("You are not authorized to perform this action.");
  }
  return session;
}
