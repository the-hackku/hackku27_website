// export default async function RegisterPage() {
//   // If not registered, show the registration form
//   return (
//     <div className="flex flex-col items-center justify-center h-screen">
//       <p>Registration is closed</p>
//       <p>HackKU26 coming soon!</p>
//     </div>
//   );
// }

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RegistrationForm } from "@/components/forms/RegistrationForm";

export default async function RegisterPage() {
  const session = await auth();

  // If the user is not authenticated, redirect to the signin page
  if (!session) {
    redirect("/signin");
  }

  // Fetch user details from the database to check if they are already registered
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email ?? undefined },
    include: { ParticipantInfo: true, prefillData: true },
  });

  const participant = user?.ParticipantInfo;

  if (participant) {
    redirect("/");
  }

  // If not registered, show the registration form and fetch prefill data if available
  const prefillData = user?.prefillData || null;
  return (
    <div className="relative flex flex-col items-center justify-center px-4" style={{ marginTop: "-2vw" }}>
      <div
        className="border bg-white page-card w-full flex flex-col"
        style={{
          borderWidth: "2px",
          borderBottomLeftRadius: "clamp(0.75rem, 4vw, 1.5rem)",
          borderBottomRightRadius: "clamp(0.75rem, 4vw, 1.5rem)",
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -2px 4px rgba(0,0,0,0.08), 0 6px 12px rgba(0,0,0,0.12)`,
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
