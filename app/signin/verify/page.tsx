import { connection } from "next/server";
import { Suspense } from "react";
import { OTPVerify } from "@/components/pages/signin_verify";

export default async function VerifyPage() {
  // This is a workaround because Next for some reason refuses to recognize that OTPVerify is a Client Component that's always wrapped in Suspense
  await connection();
  return (
    <div className="max-w-md mx-auto py-16 text-center px-4">
      <h1 className="text-2xl font-bold mb-4">Complete Sign In</h1>
      <Suspense fallback={<p>Loading...</p>}>
        <OTPVerify />
      </Suspense>
    </div>
  );
}

export const instant = false;