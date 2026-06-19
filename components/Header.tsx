"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface Props {
  isAdmin: boolean;
  isVolunteer: boolean;
}

export function Header({ isAdmin, isVolunteer }: Props) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 overflow-hidden bg-transparent"
      style={{ height: "clamp(160px, 10vw, 230px)" }}
    >
      {/* SVG wave cutout */}
      <svg
        viewBox="0 0 1440 380"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-0 h-full w-full"
        style={{ pointerEvents: "none" }}
      >
        <path
          d="
            M 0 0
            L 1440 0
            L 1440 290
            C 1100 290 1060 290 960 235
            C 910 210 850 200 800 200
            L 640 200
            C 590 200 530 210 480 235
            C 380 290 340 290 260 290
            L 0 290
            Z
          "
          fill="#F3F4F6"
        />
        <path
          d="M0 290 L260 290 C340 290 380 290 480 235 C530 210 590 200 640 200 L800 200 C850 200 910 210 960 235 C1060 290 1100 290 1440 290"
          fill="none"
          stroke="#d7d7d7"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute top-0 right-[10vw] z-50">
        <Link
          href="https://mlh.io/seasons/2027/events"
          target="_blank"
          passHref
          className="drop-shadow-lg"
        >
          <motion.div
            whileHover={{
              scale: 1.05,
              y: 2,
              transition: { duration: 0.2 },
            }}
          >
            <Image
              src="/images/mlh-badge.svg"
              alt="MLH Badge"
              width={0}
              height={0}
              style={{ width: "clamp(28px, 5vw, 80px)", height: "clamp(46px, 8vw, 140px)" }}
              priority={true}
            />
          </motion.div>
        </Link>
      </div>
<div className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 z-50">
  <Link href="/">
    <Image
      src="/images/branding/logo_nobackground.png"
      alt="HackKU"
      width={160}
      height={40}
      style={{
        width: "clamp(50px, 8vw, 130px)",
        height: "auto",
        objectFit: "contain",
      }}
      priority
    />
  </Link>
</div>
    </header>
  );
}

export default Header;
