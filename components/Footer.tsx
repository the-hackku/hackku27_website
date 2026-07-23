"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconBrandInstagram,
  IconBrandGithub,
  IconBrandLinkedin,
} from "@tabler/icons-react";

export default function Footer() {
  const pathname = usePathname();

  // Don't render footer on /schedule or /info
  if (pathname === "/schedule" || pathname === "/info") return null;

  return (
    <footer className="bg-gray-100 text-gray-600 w-full relative z-10 border-t border-t-[#d7d7d7] footer-desktop-height flex items-center">
      <div className="container mx-auto px-4 flex items-center justify-between gap-2 py-1 w-full">
        
        {/* Left: Social icons */}
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

        {/* Center (Mobile): Single Legal Link */}
        <Link
          href="/legal"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 underline underline-offset-2 text-sm hover:text-gray-300 transition-colors sm:hidden whitespace-nowrap"
        >
          Legal
        </Link>

        {/* Center (Desktop): Full Legal Links */}
        <div className="hidden sm:flex items-center gap-x-2 gap-y-0">
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

        {/* Right: Copyright (single element for both mobile & desktop) */}
        <div className="text-sm text-gray-500 whitespace-nowrap">
          ©2027 HackKU Team
        </div>

      </div>
    </footer>
  );
}