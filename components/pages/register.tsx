import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RegistrationForm } from "@/components/forms/RegistrationForm";
import constants from "@/constants";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import type { RegistrationData } from "@/types/schemas/participant";

export async function Register() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session?.session.userId },
  });

  const participant = user?.isRegistered;

  if (participant) {
    redirect("/");
  }

  const prefillData = user?.prefillData as RegistrationData | null | undefined;

  return (
    <>
      {new Date() > new Date(constants.endDate) ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <p>Registration is closed</p>
          <p>HackKU27 has ended. Thank you for participating!</p>
        </div>
      ) : (
        <RegistrationForm prefillData={prefillData} />
      )}
    </>
  );
}
