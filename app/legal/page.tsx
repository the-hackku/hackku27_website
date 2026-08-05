"use client";

import { IconCamera, IconLock, IconShieldCheck } from "@tabler/icons-react";
import { motion } from "motion/react";
import Link from "next/link";
import { pageCardStyle } from "@/components/PageCard";

export default function LegalPage() {
  const legalLinks = [
    {
      title: "Photo Release & Waiver",
      href: "/legal/waiver",
      bgColor: "#0051ba", // KU Blue
      textColor: "text-white",
      icon: IconCamera,
    },
    {
      title: "Code of Conduct",
      href: "/legal/code-of-conduct",
      bgColor: "#f2a900", // Yellow
      textColor: "text-black",
      icon: IconShieldCheck,
    },
    {
      title: "Privacy Policy",
      href: "/legal/privacy-policy",
      bgColor: "#ea4335", // Red
      textColor: "text-white",
      icon: IconLock,
    },
  ];

  return (
    <div
      className="relative flex flex-col items-center justify-center px-4"
      style={{ marginTop: "-2vw" }}>
      <div
        className="relative z-10 flex flex-row items-center justify-center w-full"
        style={{ overflow: "visible" }}>
        <motion.div
          className="border bg-white page-card flex flex-col items-center justify-start w-full sm:w-auto"
          style={{
            ...pageCardStyle,
            gap: "1.75rem",
            width: "100%",
            maxWidth: "650px",
            padding: "1.75rem",
            paddingBottom: "1.75rem",
            paddingTop: "2.25rem",
          }}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 35 }}>
          {/* Header row with back link */}
          <div className="flex items-center justify-between w-full">
            <Link
              href="/"
              className="text-gray-400 hover:text-gray-700 transition-colors text-sm">
              ← Back to Home
            </Link>
          </div>

          {/* Title Branding */}
          <div className="flex flex-col items-center gap-1">
            <h1 className="font-bold text-center text-4xl">
              Hack<span className="text-blue-500">K</span>
              <span className="text-red-500">U/</span>
              <span className="text-yellow-500">{">"}</span> Legal
            </h1>

            <h3 className="text-[#666666] text-xl text-center">
              Select a document to review.
            </h3>
          </div>

          {/* Document Action Buttons */}
          <div className="flex flex-col w-full gap-4">
            {legalLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-xl shadow-md transition-all duration-300 ease-out hover:scale-[1.01] hover:shadow-xl cursor-pointer w-full h-16"
                  style={{
                    backgroundColor: link.bgColor,
                    border: "1px solid rgba(0,0,0,0.1)",
                  }}>
                  <Icon
                    className={`w-6 h-6 ${link.textColor} opacity-90 group-hover:opacity-100`}
                  />
                  <span
                    className={`${link.textColor} font-semibold text-lg opacity-90 group-hover:opacity-100`}>
                    {link.title}
                  </span>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-300" />
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
