"use client"

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const cardStyle = {
  borderWidth: "2px",
  borderRadius: "0 0 clamp(0.75rem, 4vw, 1.5rem) clamp(0.75rem, 4vw, 1.5rem)",
  borderTopLeftRadius: "50% clamp(0.5rem, 2.7vw, 2rem)",
  borderTopRightRadius: "50% clamp(0.5rem, 2.7vw, 2rem)",
  boxShadow: `
    inset 0 1px 0 rgba(255,255,255,0.9),
    inset 0 -2px 4px rgba(0,0,0,0.08),
    0 6px 12px rgba(0,0,0,0.12)`,
};

export default function HomePage() {
  const [view, setView] = useState<"welcome" | "learn">("welcome");

  const { data: session } = useSession();
  const isRegistered = session?.user?.isRegistered;

  const registerText = isRegistered ? "Sign Out" : "Register Now";
  const registerColor = isRegistered ? "#16a34a" : "#f2a900"; // green or yellow
  const registerPage = isRegistered ? "/signout" : "/register";

  return (
    <div className="relative flex flex-col items-center justify-center px-4"
      style={{ marginTop: "clamp(-2rem, 5rem, -5rem)" }}>

      <div className="relative z-10 flex flex-row items-center justify-center w-full"
        style={{ overflow: "visible" }}>

        <AnimatePresence mode="wait" initial={false}>

          {view === "welcome" && (
            <motion.div
              key="welcome"
              className="border bg-white flex flex-col items-center justify-start w-full sm:w-auto"
              style={{
                ...cardStyle,
                gap: "1.5rem",
                minWidth: "min(100%, 340px)",
                width: "100%",
                maxWidth: "40%",
                padding: "2rem",
                paddingTop: "2.5rem",
              }}
              initial={{ x: "60vw", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-60vw", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <h1 className="font-bold text-4xl text-center">
                Welcome to Hack
                <span className="text-blue-500">K</span>
                <span className="text-red-500">U/</span>
                <span className="text-yellow-500">{">"}</span>
              </h1>

              <h3 className="text-[#666666] text-xl">
                Glad to have you.
              </h3>

              <div className="flex flex-col sm:flex-row w-full gap-4 mt-2">

                <Link
                  href={registerPage}
                  className="group relative flex items-center justify-center overflow-hidden shadow-md transition-all duration-300 ease-out hover:scale-[1.01] hover:shadow-xl cursor-pointer flex-1"
                  style={{
                    backgroundColor: registerColor,
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: "0.5rem 0.5rem 0.5rem 1.5rem",
                    height: "clamp(56px, 10vw, 72px)",
                  }}
                >
                  {isRegistered ? (
                    <span className="text-white font-semibold text-xl opacity-90 group-hover:opacity-100">
                      {registerText}
                    </span>
                  ) : (
                    <span className="text-black font-semibold text-xl opacity-90 group-hover:opacity-100">
                      {registerText}
                    </span>
                  )}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-300" />
                </Link>

                <button
                  onClick={() => setView("learn")}
                  className="group relative flex items-center justify-center overflow-hidden shadow-md transition-all duration-300 ease-out hover:scale-[1.01] hover:shadow-xl cursor-pointer flex-1"
                  style={{
                    backgroundColor: "#0051ba",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: "0.5rem 0.5rem 1.5rem 0.5rem",
                    height: "clamp(56px, 10vw, 72px)",
                  }}
                >
                  <span className="text-white font-semibold text-xl">
                    Learn More
                  </span>
                </button>
              </div>
            </motion.div>
          )}

          {view === "learn" && (
            <motion.div
              key="learn"
              className="border bg-white flex flex-col w-full"
              style={{
                ...cardStyle,
                maxWidth: "clamp(320px, 55vw, 860px)",
                padding: "clamp(1.25rem, 3vw, 3rem)",
                gap: "1rem",
              }}
              initial={{ x: "30vw", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-30vw", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900 text-xl sm:text-2xl lg:text-3xl">
                  About HackKU
                </h2>

                <button
                  onClick={() => setView("welcome")}
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                >
                  ← Back
                </button>
              </div>

              <p className="text-gray-600 leading-relaxed text-base">
                HackKU is the University of Kansas's biggest hackathon, a 24-hour event where students come together to build, create, and innovate.
              </p>

              <Link
                href="/register"
                className="group relative flex items-center justify-center overflow-hidden shadow-md transition-all duration-300 ease-out hover:scale-[1.01] hover:shadow-xl cursor-pointer"
                style={{
                  backgroundColor: registerColor,
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: "0.5rem 0.5rem 0.5rem 1.5rem",
                  width: "50%",
                  height: "50px"
                }}
              >
                <span className="text-black font-semibold text-xl">
                  {registerText}
                </span>
              </Link>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}