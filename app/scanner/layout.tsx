import { auth, hasPermissions } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ScannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    await hasPermissions(session, { checkins: ["perform"] });
  } catch (error) {
    redirect("/signin");
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">{children}</div>
  );
}
