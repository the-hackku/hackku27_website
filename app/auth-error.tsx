import { AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import constants from "@/constants";

export default async function NotFound({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { error = "unknown" } = await searchParams;
  let message: string;
  if (
    error === "invalid_callback_request" ||
    error === "state_not_found" ||
    error === "internal_server_error" ||
    error === "no_callback_url" ||
    error === "oauth_provider_not_found" ||
    error === "unable_to_get_user_info" ||
    error === "unable_to_create_user" ||
    error === "unable_to_create_session"
  ) {
    message =
      "An error occurred on our end, please contact us and try again later.";
  } else if (
    error === "invalid_code" ||
    error === "state_mismatch" ||
    error === "no_code"
  ) {
    message = "We couldn't verify your sign-in, please try again.";
  } else if (error === "email_not_found") {
    message =
      "We didn't receive an email from your provider, please try with a different provider or account.";
  } else if (error === "email_doesn't_match") {
    message =
      "The email from your provider doesn't match the email you used to sign up, please try with a different provider or account.";
  } else if (error === "unable_to_link_account") {
    message =
      "We couldn't link your account, please try with a different provider or account.";
  } else if (error === "account_not_linked") {
    message =
      "Please sign in with the provider you used to sign up to link this provider.";
  } else if (error === "account_already_linked_to_different_user") {
    message =
      "This account is already linked to a different user, please try with a different provider or account.";
  } else if (error === "signup_disabled") {
    message =
      "The provider you are trying to sign in with is disabled, please try with a different provider or account.";
  } else {
    message = "An unknown error occurred, please try again later.";
  }
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6 ">
      {/* Playful animated duck */}
      <motion.div
        whileHover={{
          scale: 1.2, // Slightly increase the size on hover
          rotate: 10,
          transition: { type: "spring", stiffness: 500 }, // Smooth bounce effect
        }}
        whileTap={{ scale: 0.9, rotate: -10 }} // Shrink and rotate back on click
      >
        <Image
          src="/images/duck.webp"
          width={200}
          height={200}
          alt="Doodle Duck"
          unoptimized
        />
      </motion.div>

      <Alert variant="destructive" className="w-full max-w-md">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <AlertTitle>Error while authenticating!</AlertTitle>
        <AlertDescription>
          {`${message} `}
          If that doesn't help, contact us at
          <a
            href={`mailto:${constants.supportEmail}`}
            style={{ color: "#1a73e8", textDecoration: "none" }}>
            {constants.supportEmail}
          </a>
          for assistance.
        </AlertDescription>
      </Alert>

      {/* Button to go back to home */}
      <Button variant="outline" size="lg">
        <a href="/">Go Back to Home</a>
      </Button>
    </div>
  );
}
