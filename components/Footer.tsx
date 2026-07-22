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
  <footer className="bg-gray-100 text-gray-600 w-full relative z-10 border-t border-t-[#d7d7d7] footer-desktop-height flex items-center">
    <div className="container mx-auto px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-1 w-full">

      {/* Top row on mobile: social icons + copyright */}
      <div className="flex items-center justify-between sm:justify-start sm:gap-3">
        <div className="flex items-center gap-3 text-gray-500">
          <Link
            href="https://www.instagram.com/thehackku/"
            target="_blank"
            className="hover:text-pink-600 transition-colors"
          >
            <IconBrandInstagram className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>

          <Link
            href="https://www.linkedin.com/company/hackku/about/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-700 transition-colors"
          >
            <IconBrandLinkedin className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>

          <Link
            href="https://github.com/the-hackku"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900 transition-colors"
          >
            <IconBrandGithub className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        </div>

        {/* Copyright — right side on mobile, hidden on sm+ (shown in its own slot) */}
        <div className="text-sm text-gray-500 sm:hidden">
          ©2027 HackKU Team
        </div>
      </div>

      {/* Legal links */}
      <div className="flex items-center flex-wrap gap-x-2 gap-y-0">
        <Link
          href="/legal/code-of-conduct"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 underline underline-offset-2 text-sm hover:text-gray-300 transition-colors"
        >
          Code of Conduct
        </Link>
        <span className="text-gray-300 text-sm">·</span>
        <Link
          href="/legal/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 underline underline-offset-2 text-sm hover:text-gray-300 transition-colors"
        >
          Privacy Policy
        </Link>
        <span className="text-gray-300 text-sm">·</span>
        <Link
          href="/legal/waiver"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 underline underline-offset-2 text-sm hover:text-gray-300 transition-colors"
        >
          Photo Release & Waiver
        </Link>
      </div>

      {/* Copyright — only on sm+ */}
      <div className="hidden sm:block text-sm text-gray-500 text-right">
        ©2027 HackKU Team
      </div>

    </div>
  </footer>
  );
}

