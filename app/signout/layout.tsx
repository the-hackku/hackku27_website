import { auth } from "@/auth";
import { redirect } from "next/navigation";


export default async function ReimbursemenrLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // If the user is not authenticated, redirect to the signin page
  if (!session) {
    redirect("/");
  }

  // If not registered, show the registration form
  return <div className="mb-10">{children}</div>;
}
