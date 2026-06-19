"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconBrandInstagram,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandDiscord,
} from "@tabler/icons-react";
import constants from "@/constants";

export default function Footer() {
  const pathname = usePathname();

  // Don't render footer on /schedule
  if (pathname === "/schedule") return null;
  if (pathname === "/info") return null;

  return (
  <footer className="bg-gray-100 text-gray-600 w-full relative z-10 border-t border-t-[#d7d7d7]"
    style={{ minHeight: "clamp(48px, 8vh, 80px)" }}>
    <div className="container mx-auto px-4 h-full flex flex-wrap items-center justify-between gap-3 py-3"
      style={{ minHeight: "clamp(48px, 8vh, 80px)" }}>

      {/* Left - Social Links */}
      <div className="flex items-center gap-3 text-gray-500">
        <Link
          href="https://www.instagram.com/thehackku/"
          target="_blank"
          className="hover:text-pink-600 transition-colors"
        >
          <IconBrandInstagram className="w-5 h-5" />
        </Link>

        <Link
          href="https://www.linkedin.com/company/hackku/about/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-700 transition-colors"
        >
          <IconBrandLinkedin className="w-5 h-5" />
        </Link>

        <Link
          href="https://github.com/the-hackku"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-900 transition-colors"
        >
          <IconBrandGithub className="w-5 h-5" />
        </Link>
      </div>

      {/* Center text */}
      <div className="text-gray-400 underline underline-offset-2 text-xs sm:text-sm">
        <Link
          href="/mlh/code-of-conduct"
          target="_blank"
          rel="noopener noreferrer"
        >
          MLH Code of Conduct
        </Link>
      </div>

      {/* Right text */}
      <div className="text-right text-xs sm:text-sm text-gray-500">
        ©2027 HackKU Team
      </div>

    </div>
  </footer>
  );
}
