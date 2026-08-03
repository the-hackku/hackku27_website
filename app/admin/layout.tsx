import { headers } from "next/headers";
import { forbidden, redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    // Check if the user is an admin
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      // Redirect to sign-in page if not authorized
      redirect("/signin");
    } else if (session.session.role !== "ADMIN") {
      // Redirect to sign-in page if not authorized
      forbidden();
    }
  } catch {
    // Redirect to sign-in page if not authorized
    redirect("/signin");
  }

  // If authorized, render the children
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">{children}</div>
  );
}
