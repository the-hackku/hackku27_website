import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ReimbursementLayout({}: // children,
{
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 🚀 If the user is not authenticated, redirect to the signin page
  if (!session?.session.userId) {
    redirect("/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.session.userId },
    include: { travelReimbursement: true, ParticipantInfo: true },
  });

  if (!user?.ParticipantInfo) {
    redirect("/profile");
  }

  if (user.travelReimbursement) {
    redirect("/profile");
  } else {
    redirect("/profile");
  }
}
//   // 🚀 If they haven't applied yet, show the reimbursement form
//   return <div className="mb-10">{children}</div>;
// }
