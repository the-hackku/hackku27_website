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
  <footer className="bg-gray-100 text-gray-600 h-[8vh] w-full relative z-10 border-t-[0.3vh] border-t-[#d7d7d7]">
    <div className="container mx-auto px-[2vh] h-full flex align-center justify-center items-center gap-[25vh]">

      {/* Left - Social Links */}
      <div className="flex items-center gap-[1.2vh] text-gray-500">
        {/* <Link
          href={constants.discordInvite}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-400 transition-colors"
        >
          <IconBrandDiscord className="w-[2.2vh] h-[2.2vh]" />
        </Link> */}

        <Link
          href="https://www.instagram.com/thehackku/"
          target="_blank"
          className="hover:text-pink-600 transition-colors"
        >
          <IconBrandInstagram className="w-[2.2vh] h-[2.2vh]" />
        </Link>

        <Link
          href="https://www.linkedin.com/company/hackku/about/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-700 transition-colors"
        >
          <IconBrandLinkedin className="w-[2.2vh] h-[2.2vh]" />
        </Link>

        <Link
          href="https://github.com/the-hackku"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-900 transition-colors"
        >
          <IconBrandGithub className="w-[2.2vh] h-[2.2vh]" />
        </Link>
      </div>

      {/* Center text */}
      <div className="text-gray-400 underline underline-offset-[0.3vh] text-[1.4vh]">
        <Link
          href="/mlh/code-of-conduct"
          target="_blank"
          rel="noopener noreferrer"
        >
          MLH Code of Conduct
        </Link>
      </div>

      {/* Right text */}
      <div className="text-right text-[1.4vh] text-gray-500">
        ©2027 HackKU Team
      </div>

    </div>
  </footer>
  );
}
