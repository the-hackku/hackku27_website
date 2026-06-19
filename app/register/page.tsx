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
    <div className="mb-10">
      <RegistrationForm prefillData={prefillData} />
    </div>
  );
}
