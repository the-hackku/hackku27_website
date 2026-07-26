"use client";

import { authClient, useSession } from "@/lib/auth/auth-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import {
  IconBrandDiscordFilled,
  IconBrandGithubFilled,
  IconBrandGoogleFilled,
  IconLoader
} from "@tabler/icons-react";
import Link from "next/link";

interface SignInForm {
  email: string;
}

const SignInPage = () => {
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(60);
  // This state will hold the name of the provider that is currently loading.
  const [activeLoadingButton, setActiveLoadingButton] = useState<
    "google" | "discord" | "github" | "mymlh" | "email" | null
  >(null);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignInForm>();
  const email = watch("email");
  const { data: session, isPending, error: sessionError, refetch } = useSession();

  const handleSocialSignIn = async (provider: "google" | "discord" | "github" | "mymlh") => {
    setActiveLoadingButton(provider);
    await authClient.signIn.social({
      provider: provider,
      callbackURL: "/register"
    });
  };

  useEffect(() => {
    if (session) {
      router.push("/register");
    }
  }, [session, router]);

  useEffect(() => {
    if (!emailSent) return;

    const storedTime = localStorage.getItem("resendStartTime");
    const startTime = storedTime ? parseInt(storedTime, 10) : Date.now();
    localStorage.setItem("resendStartTime", startTime.toString());

    const updateTimer = () => {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      setResendTimer(Math.max(60 - elapsedTime, 0));
    };

    updateTimer(); // Update immediately
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [emailSent]);

  const sendMagicLink = async (email: string) => {
    setError(null);
    try {
      const { data, error } = await authClient.signIn.magicLink({
        email: email,
        callbackURL: "/register"
      });
      if (error) {
        setError(
          "An error occurred while sending the email. Please try again.",
        );
        toast.error(
          "An error occurred while sending the email. Please try again.",
        );
      } else {
        setEmailSent(true);
        setResendTimer(60); // Reset the timer
        toast.success("Magic link has been sent! Please check your email.");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setActiveLoadingButton(null);
    }
  };

  const onSubmit = async () => {
    setActiveLoadingButton("email");
    await sendMagicLink(email);
  };

  const handleResend = async () => {
    if (email && resendTimer === 0) {
      setActiveLoadingButton("email");
      await sendMagicLink(email);
    } else {
      setError("Please wait before resending the magic link.");
    }
  };

  if (isPending) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
        <Card
          className="border rounded-lg p-4 shadow-sm bg-[#ffffff] fixed top-[7vw] justify-self-center w-[30vw] mb-[2vw]"
          style={{
            borderRadius: "0 0 4vw 4vw",
            borderTopLeftRadius: "50% 1vw",
            borderTopRightRadius: "50% 1vw",
            width: "25vw",
            height: "35vw",
            minWidth: "480px",
          }}
        >
          <CardHeader>
            <CardTitle className="text-center text-xl sm:text-xl">
              Sign In or Sign Up
            </CardTitle>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <>
              <p className="text-center text-gray-600 text-sm sm:text-base">
                We have sent a magic link to <strong>{email}</strong>.
              </p>
              <p className="text-center text-gray-600 mt-2 text-sm sm:text-base">
                Please check your inbox and click the link to sign in.
              </p>
              <p className="text-center text-gray-600 mt-2 text-sm sm:text-base p-2 bg-indigo-50 rounded">
                Emails sent to <b>@ku.edu</b> or other{" "}
                <b>institutional emails</b> may be marked as spam — please add{" "}
                <b>signin@auth.hackku.org</b> to your safe senders list, or{" "}
                <b>sign in with an OAuth provider below instead</b>.
                If you're new, signing up means you agree to our{" "}
                <Link
                  href="/legal/privacy-policy"
                  className="text-blue-600 hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </p>
              </>
            ) : (
              <p className="text-center text-muted-foreground text-sm mb-6">
              Sign in with an OAuth provider or your email to continue to
              registration or the dashboard! If you're new, signing up means you
              agree to our{" "}
              <Link
                href="/legal/privacy-policy"
                className="text-blue-600 hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </p>
            )}

            {/* Google, Discord, GitHub Sign-In Buttons */}
            <div className="flex flex-col gap-3 mb-6">
              {/*               
              <Button
                onClick={handleMyMLHSignIn}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm sm:text-base bg-[#f5f5f5] text-black rounded-md transition hover:brightness-90"
                style={{ backgroundColor: "#ffffff" }}
              >
                <Image
                  src="/images/branding/mlh-logo.svg"
                  alt="MLH Logo"
                  width={40}
                  height={20}
                />
                {activeLoadingButton === "mymlh"
                  ? "Loading..."
                  : "Continue with MyMLH"}
              </Button>
              */}
              <Button
                onClick={() => handleSocialSignIn("google")}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm sm:text-base bg-[#4285F4] text-white rounded-md transition hover:brightness-90"
                style={{ backgroundColor: "#4285F4" }}
              >
                {activeLoadingButton === "google" ? (
                  <IconLoader className="animate-spin h-5 w-5" />
                ) : (
                  <IconBrandGoogleFilled className="h-5 w-5" />
                )}
                {activeLoadingButton === "google"
                  ? "Loading..."
                  : "Continue with Google"}
              </Button>

              <Button
                onClick={() => handleSocialSignIn("discord")}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm sm:text-base text-white rounded-md transition hover:brightness-90"
                style={{ backgroundColor: "#5865F2" }}
              >
                {activeLoadingButton === "discord" ? (
                  <IconLoader className="animate-spin h-5 w-5" />
                ) : (
                  <IconBrandDiscordFilled className="h-5 w-5" />
                )}
                {activeLoadingButton === "discord"
                  ? "Loading..."
                  : "Continue with Discord"}
              </Button>

              <Button
                onClick={() => handleSocialSignIn("github")}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm sm:text-base text-white rounded-md transition hover:brightness-80"
                style={{ backgroundColor: "#24292E" }}
              >
                {activeLoadingButton === "github" ? (
                  <IconLoader className="animate-spin h-5 w-5" />
                ) : (
                  <IconBrandGithubFilled className="h-5 w-5" />
                )}
                {activeLoadingButton === "github"
                  ? "Loading..."
                  : "Continue with GitHub"}
              </Button>
            </div>

            <div className="flex items-center justify-center mb-6">
              <hr className="w-1/3 border-gray-300" />
              <p className="mx-2 text-gray-400 text-sm">or</p>
              <hr className="w-1/3 border-gray-300" />
            </div>

            {/* Email Sign-In Form */}
            {!emailSent ? (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                  <label
                    className="block text-sm font-medium mb-1 text-gray-700"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <Input
                    id="email"
                    placeholder="Enter your email"
                    {...register("email", { required: "Email is required" })}
                    aria-invalid={errors.email ? "true" : "false"}
                    className="w-full text-sm sm:text-base px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={activeLoadingButton !== null || !email}
                  className="w-full py-3 text-sm sm:text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition hover:shadow-md"
                >
                  {activeLoadingButton === "email" ? (
                    <>
                      <IconLoader className="animate-spin h-5 w-5 mr-2" />
                      Sending...
                    </>
                  ) : (
                    "Send Magic Link"
                  )}
                </Button>
              </form>
            ) : (
              <div className="flex justify-center mt-6 gap-4">
                <Button
                  onClick={handleResend}
                  disabled={activeLoadingButton !== null || resendTimer > 0}
                  className="py-3 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-md transition hover:shadow-md"
                >
                  {activeLoadingButton === "email" ? (
                    <>
                      <IconLoader className="animate-spin h-5 w-5 mr-2" />
                      Resending...
                    </>
                  ) : resendTimer > 0 ? (
                    `Resend in ${resendTimer}s`
                  ) : (
                    "Resend Link"
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setEmailSent(false);
                    setError(null);
                  }}
                  variant="outline"
                  className="py-3 text-sm sm:text-base border-gray-300 rounded-md text-gray-700 hover:border-gray-400 hover:text-gray-900 transition"
                >
                  Change Email
                </Button>
              </div>
            )}

            {error && (
              <p className="text-red-500 text-center text-xs sm:text-sm mt-4">
                {error}
              </p>
            )}
          </CardContent>
        </Card>
    </div>
  );
};

export default SignInPage;
