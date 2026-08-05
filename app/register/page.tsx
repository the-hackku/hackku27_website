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
    headers: await headers()
  });

  // Fetch user details from the database to check if they are already registered
  const user = await prisma.user.findUnique({
    where: { id: session?.session.userId }
  });

  const participant = user?.isRegistered;

  if (participant) {
    redirect("/");
  }

  // If not registered, show the registration form and fetch prefill data if available
  const prefillData = user?.prefillData as RegistrationData || null;
  return (
    <div className="relative flex flex-col items-center justify-center px-4" style={{ marginTop: "-2vw" }}>
      <div
        className="border bg-white page-card w-full flex flex-col"
        style={{
          borderWidth: "2px",
          borderBottomLeftRadius: "clamp(0.75rem, 4vw, 1.5rem)",
          borderBottomRightRadius: "clamp(0.75rem, 4vw, 1.5rem)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -2px 4px rgba(0,0,0,0.08), 0 6px 12px rgba(0,0,0,0.12)",
          width: "100%",
          maxWidth: "650px",
          paddingLeft: "1rem",
          paddingRight: "1rem",
          paddingTop: "3rem",
          paddingBottom: "3rem",
          gap: "1rem",
          minHeight: "70vh",
        }}
      >
        <RegistrationForm prefillData={prefillData} />
      </div>
    </div>
  );
}
