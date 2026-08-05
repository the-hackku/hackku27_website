"use client";

import {
  IconBrandDiscordFilled,
  IconBrandGithubFilled,
  IconLoader,
} from "@tabler/icons-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { OTPInput } from "@/components/customui/form-inputs/OTPInput";
import { pageCardStyle } from "@/components/PageCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient, useSession } from "@/lib/auth/auth-client";

const cardStyle = {
  ...pageCardStyle,
  width: "100%",
  maxWidth: "650px",
  paddingLeft: "1rem",
  paddingRight: "1rem",
  paddingTop: "3rem",
  paddingBottom: "2rem",
  gap: "1rem",
  display: "flex",
  flexDirection: "column" as const,
};

const GoogleIcon = () => (
  <svg
    role="img"
    aria-label="Google icon"
    className="h-5 w-5"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

interface SignInForm {
  email: string;
}

interface OTPForm {
  otp: string;
}

const SignInPage = () => {
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(60);
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
  const {
    register: registerOTP,
    control: controlOTP,
    handleSubmit: handleSubmitOTP,
    formState: { errors: errorsOTP },
    watch: watchOTP,
  } = useForm<OTPForm>();
  const emailWatch = watch("email");
  const {
    data: session,
    isPending,
    error: sessionError,
    refetch,
  } = useSession();

  const handleSocialSignIn = async (
    provider: "google" | "discord" | "github" | "mymlh",
  ) => {
    setActiveLoadingButton(provider);
    await authClient.signIn.social({
      provider,
      callbackURL: "/register",
    });
  };

  useEffect(() => {
    if (session) {
      router.push("/register");
    }
  }, [session, router]);

  useEffect(() => {
    if (!emailSent) {
      return;
    }
    const storedTime = localStorage.getItem("resendStartTime");
    const startTime = storedTime ? Number.parseInt(storedTime, 10) : Date.now();
    localStorage.setItem("resendStartTime", startTime.toString());
    const updateTimer = () => {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      setResendTimer(Math.max(60 - elapsedTime, 0));
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [emailSent]);

  const sendMagicLink = async (email: string) => {
    setError(null);
    try {
      const { data, error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
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
        setResendTimer(60);
        toast.success("One-time code has been sent! Please check your email.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again later.");
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setActiveLoadingButton(null);
    }
  };

  const onSubmit = async () => {
    setActiveLoadingButton("email");
    await sendMagicLink(emailWatch);
  };

  const handleTokenVerification = async () => {
    setActiveLoadingButton("email");
    try {
      const { data, error } = await authClient.signIn.emailOtp({
        email: emailWatch,
        otp: watchOTP("otp"),
      });
      if (error) {
        setError("Invalid or expired code. Please try again.");
        toast.error("Invalid or expired code. Please try again.");
      } else {
        await refetch();
        router.push("/register");
      }
    } catch {
      setError("An unexpected error occurred. Please try again later.");
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setActiveLoadingButton(null);
    }
  };

  const handleResend = async () => {
    if (emailWatch && resendTimer === 0) {
      setActiveLoadingButton("email");
      await sendMagicLink(emailWatch);
    } else {
      setError("Please wait before resending the one-time code.");
    }
  };

  const handleChangeEmail = () => {
    setEmailSent(false);
    setError(null);
    setActiveLoadingButton(null);
  };

  if (isPending) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (emailSent) {
    return (
      <div
        className="relative flex flex-col items-center justify-center px-4"
        style={{ marginTop: "-2vw" }}>
        <div className="border bg-white page-card" style={cardStyle}>
          <h2 className="text-center text-xl font-semibold">
            Check Your Email
          </h2>
          <p className="text-center text-gray-600 text-sm">
            We sent a one-time code to <strong>{emailWatch}</strong>. Enter it here or click the link in the email to sign in. The code will expire in 10 minutes.
          </p>
          <p className="text-center text-gray-600 text-sm p-3 bg-indigo-50 rounded-lg">
            Emails to <b>@ku.edu</b> or other institutional addresses may be
            marked as spam — add <b>signin@auth.hackku.org</b> to your safe
            senders, or use an OAuth provider below.
          </p>

          <form
            onSubmit={handleSubmitOTP(handleTokenVerification)}
            className="w-full flex flex-col gap-3"
          >
            <Controller
              name="otp"
              control={controlOTP}
              render={({ field }) => (
                <OTPInput value={field.value} onChange={field.onChange} />
              )}
            />
            <Button
              type="submit"
              disabled={activeLoadingButton !== null || !watchOTP("otp")}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer">
              {activeLoadingButton === "email" ? (
                <>
                  <IconLoader className="animate-spin h-5 w-5 mr-2" />
                  Verifying...
                </>
              ) : (
                "Verify Code →"
              )}
            </Button>
          </form>

          {/* OAuth buttons repeated */}
          <div className="flex flex-col gap-3 w-full">
            <Button
              onClick={() => handleSocialSignIn("google")}
              className="w-full flex items-center justify-center gap-2 h-11 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm font-medium cursor-pointer">
              {activeLoadingButton === "google" ? (
                <IconLoader className="animate-spin h-5 w-5 text-gray-500" />
              ) : (
                <GoogleIcon />
              )}
              {activeLoadingButton === "google"
                ? "Loading..."
                : "Continue with Google"}
            </Button>
            <Button
              onClick={() => handleSocialSignIn("discord")}
              className="w-full flex items-center justify-center gap-2 h-11 text-white font-medium border-none cursor-pointer"
              style={{ backgroundColor: "#5865F2" }}>
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
              className="w-full flex items-center justify-center gap-2 h-11 text-white font-medium border-none cursor-pointer"
              style={{ backgroundColor: "#24292E" }}>
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

          <div className="flex justify-center gap-3 w-full">
            <Button
              onClick={handleResend}
              disabled={activeLoadingButton !== null || resendTimer > 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-11 cursor-pointer">
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
              onClick={handleChangeEmail}
              variant="outline"
              className="flex-1 h-11 cursor-pointer">
              Change Email
            </Button>
          </div>

          {error && <p className="text-red-500 text-center text-sm">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center px-4 -mt-[70px] md:-mt-[40px]">
      <div className="border bg-white page-card" style={cardStyle}>
        {/* Title */}
        <h2 className="text-center text-xl font-semibold">
          Sign In or Sign Up
        </h2>

        {/* MLH — full width */}
        <Button
          onClick={() => handleSocialSignIn("mymlh")}
          className="w-full flex items-center justify-center gap-3 h-11 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 shadow-sm cursor-pointer">
          {activeLoadingButton === "mymlh" ? (
            <IconLoader className="animate-spin h-5 w-5 text-gray-600" />
          ) : (
            <Image
              src="/images/branding/mlh-logo.svg"
              alt="MLH"
              width={36}
              height={18}
            />
          )}
          <span className="font-medium">
            {activeLoadingButton === "mymlh"
              ? "Loading..."
              : "Continue with MyMLH"}
          </span>
        </Button>

        {/* Google + Discord — side by side */}
        <div className="flex gap-3 w-full">
          <Button
            onClick={() => handleSocialSignIn("google")}
            className="flex-1 flex items-center justify-center gap-2 h-11 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm font-medium cursor-pointer">
            {activeLoadingButton === "google" ? (
              <IconLoader className="animate-spin h-5 w-5 text-gray-500" />
            ) : (
              <GoogleIcon />
            )}
            {activeLoadingButton === "google" ? "..." : "Google"}
          </Button>

          {/* Discord: brand purple */}
          <Button
            onClick={() => handleSocialSignIn("discord")}
            className="flex-1 flex items-center justify-center gap-2 h-11 text-white font-medium border-none cursor-pointer"
            style={{ backgroundColor: "#5865F2" }}>
            {activeLoadingButton === "discord" ? (
              <IconLoader className="animate-spin h-5 w-5" />
            ) : (
              <IconBrandDiscordFilled className="h-5 w-5" />
            )}
            {activeLoadingButton === "discord" ? "..." : "Discord"}
          </Button>
        </div>

        {/* GitHub — full width, dark */}
        <Button
          onClick={() => handleSocialSignIn("github")}
          className="w-full flex items-center justify-center gap-2 h-11 text-white font-medium border-none cursor-pointer"
          style={{ backgroundColor: "#24292E" }}>
          {activeLoadingButton === "github" ? (
            <IconLoader className="animate-spin h-5 w-5" />
          ) : (
            <IconBrandGithubFilled className="h-5 w-5" />
          )}
          {activeLoadingButton === "github"
            ? "Loading..."
            : "Continue with GitHub"}
        </Button>

        <hr className="w-full border-gray-200" />

        {/* Email form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-3">
          <Input
            id="email"
            placeholder="Email address"
            type="email"
            {...register("email", { required: "Email is required" })}
            aria-invalid={errors.email ? "true" : "false"}
            className="w-full h-11"
          />
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email.message}</p>
          )}
          <Button
            type="submit"
            disabled={activeLoadingButton !== null || !emailWatch}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer">
            {activeLoadingButton === "email" ? (
              <>
                <IconLoader className="animate-spin h-5 w-5 mr-2" />
                Sending...
              </>
            ) : (
              "Sign in with email →"
            )}
          </Button>
        </form>

        {error && <p className="text-red-500 text-center text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default SignInPage;
