import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RegistrationForm } from "@/components/forms/RegistrationForm";
import constants from "@/constants";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import type { RegistrationData } from "../../types/schemas/participant";

export default async function RegisterPage() {
  if (new Date() > new Date(constants.endDate)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>Registration is closed</p>
        <p>HackKU27 has ended. Thank you for participating!</p>
      </div>
    );
  }
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If the user is not authenticated, redirect to the signin page
  if (!session) {
    redirect("/signin");
  }

  // Fetch user details from the database to check if they are already registered
  const user = await prisma.user.findUnique({
    where: { id: session.session.userId },
  });

  const participant = user?.isRegistered;

  if (participant) {
    redirect("/");
  }

  // If not registered, show the registration form and fetch prefill data if available
  const prefillData = (user?.prefillData as RegistrationData) || null;
  return (
    <div className="mb-10">
      <RegistrationForm prefillData={prefillData} />
    </div>
  );
}
