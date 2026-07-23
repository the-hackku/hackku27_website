"use client";

import { authClient } from "@/lib/auth/auth-client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { pageCardStyle } from "@/components/PageCard";

export default function HomePage() {
  const [view, setView] = useState<"welcome" | "learn">("welcome");

  const { data: session } = authClient.useSession();
  const isRegistered = session?.session.isRegistered;

  const searchParams = useSearchParams();
  const router = useRouter();

  // Reset to welcome view when the header logo is clicked (?reset param)
  useEffect(() => {
    if (searchParams.has("reset")) {
      setView("welcome");
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router]);

  const registerText = isRegistered ? "Sign Out" : "Register Now";
  const registerColor = isRegistered ? "#16a34a" : "#f2a900"; // green or yellow
  let registerPage: string;
  if (isRegistered) {
    registerPage = "/signout";
  } else if (!session) {
    registerPage = "/signin";
  } else {
    registerPage = "/register";
  }
  return (
    <div className="relative flex flex-col items-center justify-center px-4 -mt-[70px] md:-mt-[40px]">

      <div className="relative z-10 flex flex-row items-center justify-center w-full"
        style={{ overflow: "visible" }}>

        <AnimatePresence mode="popLayout" initial={false}>
          {view === "welcome" && (
            <motion.div
              key="welcome"
              className="border bg-white page-card flex flex-col items-center justify-start w-full sm:w-auto"
              style={{
                ...pageCardStyle,
                gap: "2rem",
                width: "100%",
                maxWidth: "650px",
                padding: "1.75rem",
                paddingBottom: "1.25rem",
                paddingTop: "3.0rem",
              }}
              initial={{ x: "60vw", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-60vw", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 35 }}
            >
              <h1 className="font-bold text-center text-4xl">
                Welcome to Hack
                <span className="text-blue-500">K</span>
                <span className="text-red-500">U/</span>
                <span className="text-yellow-500">{">"}</span>
              </h1>

              <h3 className="text-[#666666] text-xl text-center">
                Thanks for stopping by.
              </h3>

              <div className="flex flex-col sm:flex-row w-full gap-8">

                {/* Register button */}
                <Link
                  href={registerPage}
                  className="register-btn group relative flex items-center justify-center overflow-hidden shadow-md transition-all duration-300 ease-out hover:scale-[1.01] hover:shadow-xl cursor-pointer w-full sm:flex-1 h-16"
                  style={{
                    backgroundColor: registerColor,
                    border: "1px solid rgba(0,0,0,0.1)",
                  }}
                >
                  {isRegistered ? (
                    <span className="text-white font-semibold text-lg opacity-90 group-hover:opacity-100">
                      {registerText}
                    </span>
                  ) : (
                    <span className="text-black font-semibold text-lg opacity-90 group-hover:opacity-100">
                      {registerText}
                    </span>
                  )}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-300" />
                </Link>

                {/* Learn More button */}
                <button
                  onClick={() => setView("learn")}
                  className="learn-btn group relative flex items-center justify-center overflow-hidden shadow-md transition-all duration-300 ease-out hover:scale-[1.01] hover:shadow-xl cursor-pointer w-full sm:flex-1 h-16"
                  style={{
                    backgroundColor: "#0051ba",
                    border: "1px solid rgba(0,0,0,0.1)",
                  }}
                >
                  <span className="text-white font-semibold text-lg">
                    Learn More
                  </span>
                </button>
              </div>
            </motion.div>
          )}

          {view === "learn" && (
            <motion.div
              key="learn"
              className="border bg-white about-card flex flex-col w-full overflow-hidden"
              style={{
                ...pageCardStyle,
                width: "100%",
                maxWidth: "650px",
                gap: "1.25rem",
                padding: "1.5rem",
                paddingTop: "2.25rem",
                paddingBottom: "1rem"
              }}
              initial={{ x: "30vw", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-30vw", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 35 }}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900 text-2xl">
                  About HackKU
                </h2>
                <button
                  onClick={() => setView("welcome")}
                  className="text-gray-400 hover:text-gray-700 transition-colors text-sm cursor-pointer"
                >
                  ← Back
                </button>
              </div>

              <p className="text-gray-600 leading-relaxed text-base">
                HackKU is the University of Kansas's biggest hackathon, a
                36-hour event where students come together to build, create, and
                innovate.
              </p>

              {/* Stats row */}
              <div className="flex gap-3">
                <div className="flex-1 rounded-lg px-4 py-3 text-center" style={{ backgroundColor: "#fff3cd", border: "1px solid #f2a900" }}>
                  <div className="font-bold text-xl" style={{ color: "#b87a00" }}>68+</div>
                  <div className="text-xs text-gray-500 mt-0.5">Schools</div>
                </div>
                <div className="flex-1 rounded-lg px-4 py-3 text-center" style={{ backgroundColor: "#e8f0fe", border: "1px solid #1a73e8" }}>
                  <div className="font-bold text-xl text-blue-700">400+</div>
                  <div className="text-xs text-gray-500 mt-0.5">Hackers</div>
                </div>
                <div className="flex-1 rounded-lg px-4 py-3 text-center" style={{ backgroundColor: "#fce8e6", border: "1px solid #ea4335" }}>
                  <div className="font-bold text-xl text-red-600">$8k+</div>
                  <div className="text-xs text-gray-500 mt-0.5">In Prizes</div>
                </div>
              </div>

              <Link
                href={registerPage}
                className="group relative flex items-center justify-center overflow-hidden shadow-md transition-all duration-300 ease-out hover:scale-[1.01] hover:shadow-xl cursor-pointer w-full h-14"
                style={{
                  backgroundColor: registerColor,
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: "20px"
                }}
              >
                <span className={`font-semibold text-lg opacity-90 group-hover:opacity-100 ${isRegistered ? "text-white" : "text-black"}`}>
                  {registerText}
                </span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-300" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
