"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth/auth-client";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("otp");
  const email = searchParams.get("email");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleTokenVerification() {
    if (!(token && email)) {
      setErrorMessage("Invalid or missing verification details.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const { error } = await authClient.signIn.emailOtp({
      email,
      otp: token,
    });

    if (error) {
      setLoading(false);
      setErrorMessage("One-time code expired or invalid, please request a new one.");
    } else {
      router.push("/profile");
    }
  }

  function handleReturnToSignIn() {
    router.push("/signin");
  }

  if (!(token && email)) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Complete Sign In</h1>
        <p className="text-red-500 mb-6">Invalid verification link.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-16 text-center px-4">
      <h1 className="text-2xl font-bold mb-4">Complete Sign In</h1>

      {errorMessage !== "" ? (
        <div>
            <p className="text-red-500 mb-6 text-sm">{errorMessage}</p>
            <button
                type="button"
                onClick={handleReturnToSignIn}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition"
            >
                Return to Sign In
            </button>
        </div>
      ) : loading ? (
        <p className="text-gray-600">Verifying your session...</p>
      ) : (
        <div>
          <p className="text-gray-600 mb-6">
            Click the button below to confirm your login for <span className="font-semibold">{email}</span>.
          </p>
          <button
            type="button"
            onClick={handleTokenVerification}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition"
          >
            Confirm & Sign In
          </button>
        </div>
      )}
    </div>
  );
}