"use client";

import { AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();
  const handleGoBack = () => {
    router.push("/");
  };

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

      {/* Alert with playful message */}
      <Alert variant="destructive" className="w-full max-w-md bg-white/75">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <AlertTitle>Not the duck you&apos;re looking for!</AlertTitle>
        <AlertDescription>
          Oops! The page you&apos;re looking for doesn&apos;t exist.
        </AlertDescription>
      </Alert>

      {/* Button to go back to home */}
      <Button
        variant="outline"
        size="lg"
        className="bg-white/75 hover:bg-gray-300/75"
        onClick={handleGoBack}>
        Go Back to Home
      </Button>
    </div>
  );
}
