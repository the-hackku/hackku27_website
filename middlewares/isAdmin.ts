import { auth } from "@/auth";

export async function isAdmin() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    throw new Error("You are not authorized to perform this action.");
  }

  return session;
}

export async function isAdminOrVolunteer(){
  const session = await auth();
  if(!session || !(session.user.role == "ADMIN" || session.user.role == "VOLUNTEER")) {
    throw new Error("You are not authorized to perform this action.");
  }
  return session;
}