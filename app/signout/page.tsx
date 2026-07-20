"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { IconLoader } from "@tabler/icons-react";

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    const performSignOut = async () => {
      // await signOut({ redirect: false }); // Sign out without immediate redirect
      await authClient.signOut();
      router.refresh();
    };

    performSignOut();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <IconLoader className="animate-spin text-blue-500" size={40} />
      <p className="mt-4 text-lg text-gray-600">Signing you out...</p>
    </div>
  );
}
