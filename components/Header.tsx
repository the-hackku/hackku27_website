"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 overflow-hidden bg-transparent"
      style={{ height: "clamp(100px, 10vw, 230px)" }}
    >
      {/* SVG Container class */}
      <div className="absolute inset-x-0 top-0 h-full pointer-events-none">
        {/* Left header SVG */}
        <svg
          viewBox="0 0 100 380"
          preserveAspectRatio="none"
          className="absolute top-0 left-0 h-full"
          style={{
            width: "calc(50% - 639px)",
            pointerEvents: "none",
          }}
        >
          <path
            d="M 0 0 L 100 0 L 100 290 L 0 290 Z"
            fill="#F3F4F6"
          />
          <path
            d="M 0 290 L 100 290"
            fill="none"
            stroke="#d7d7d7"
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Header Dip SVG */}
        <svg
          viewBox="0 0 1280 380"
          preserveAspectRatio="none"
          className="absolute top-0 h-full w-[1280px] left-1/2 -translate-x-1/2"
          style={{ pointerEvents: "none" }}
        >
          <path
            d="
              M 0 0
              L 1280 0
              L 1280 290
              C 1110 290 1018 285 894 232
              C 833 212 779 202 709 202
              L 571 202
              C 501 202 447 212 386 232
              C 262 285 170 290 0 290
              Z
            "
            fill="#F3F4F6"
          />
          <path
            d="
              M 0 290
              C 170 290 262 285 386 232
              C 447 212 501 202 571 202
              L 709 202
              C 779 202 833 212 894 232
              C 1018 285 1110 290 1280 290
            "
            fill="none"
            stroke="#d7d7d7"
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Right header SVG */}
        <svg
          viewBox="0 0 100 380"
          preserveAspectRatio="none"
          className="absolute top-0 right-0 h-full"
          style={{
            width: "calc(50% - 639px)",
            pointerEvents: "none",
          }}
        >
          <path
            d="M 0 0 L 100 0 L 100 290 L 0 290 Z"
            fill="#F3F4F6"
          />
          <path
            d="M 0 290 L 100 290"
            fill="none"
            stroke="#d7d7d7"
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      <div className="absolute top-0 right-[10vw] z-50">
        <Link
          href="https://mlh.io/seasons/2027/events"
          target="_blank"
          passHref
          className="drop-shadow-lg">
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
            className="
              w-[70px] h-[80px]        
              sm:w-[80px] sm:h-[130px]  
              md:w-[clamp(30px,4vw,100px)] 
              md:h-[clamp(50px,6.5vw,150px)] 
            "
            preload={true}
          />

          </motion.div>
        </Link>
      </div>
<div className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 z-50">
  <Link href="/?reset">
    <Image
      src="/images/branding/logo_nobackground.webp"
      alt="HackKU"
      width={160}
      height={40}
      style={{
        width: "clamp(100px, 8vw, 130px)",
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