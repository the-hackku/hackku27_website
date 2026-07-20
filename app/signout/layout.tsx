import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ReimbursemenrLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If the user is not authenticated, redirect to the signin page
  if (!session) {
    redirect("/");
  }

  // If not registered, show the registration form
  return <div className="mb-10">{children}</div>;
}
