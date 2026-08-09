"use client";

import { IconLoader } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "@/lib/auth/auth-client";

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    const performSignOut = async () => {
      try {
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              router.replace("/");
            },
          },
        });
      } catch (error) {
        console.error("Error signing out:", error);
        router.replace("/");
      }
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
