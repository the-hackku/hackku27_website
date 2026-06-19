"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import SponsorsSection from "@/components/homepage/SponsorsSection";
import AboutSection from "@/components/homepage/AboutSection";
import AllSvg from "@/components/homepage/svg/AllSvg";
import FAQSection from "@/components/homepage/FAQSection";
import { IconBrandDiscord } from "@tabler/icons-react";
import constants from "@/constants";
import TeamSection from "@/components/homepage/TeamSection";
import { useSession } from "next-auth/react";

export default function HomePage() {
  // const scrollToSection = (id: string) => {
  //   const target = document.getElementById(id);
  //   target?.scrollIntoView({ behavior: "smooth" });
  // };
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isMouseOver, setIsMouseOver] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("header");
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: session } = useSession();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >

      <div className="w-full min-h-screen overflow-x-hidden text-white font-agency">
        {/* Header Section */}
        <section
          id="header"
          className="relative w-full h-screen flex items-center justify-center text-center md:justify-start md:text-left overflow-hidden pb-40 pt-32 md:pb-96 md:pt-48 md:px-40"

        >
          <motion.div
            className="z-10 max-w-[80%] text-center md:text-left md:max-w-[60%]"
            style={{
              transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
              transition: isMouseOver
                ? "transform .1s ease-out"
                : "transform 1s ease-out",
            }}
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-4xl md:text-2xl drop-shadow-md"
              style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
            >
              {constants.dates}
            </motion.p>

            {/* Event Title */}
            <motion.h1
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-7xl md:text-8xl font-dfvn drop-shadow-lg"
              style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
            >
              {constants.hackathonName}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-3xl md:text-3xl drop-shadow-md"
              style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.6)" }}
            >
              @{" "}
              <Link
                href="https://maps.app.goo.gl/g2MHMwYqWsaYvLSL9"
                target="_blank"
                className="hover:underline md:text-white"
              >
                {constants.location.toUpperCase()}
              </Link>
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-6 flex flex-row justify-center md:justify-start gap-2"
            >
              {session ? (
                <Link href="/schedule">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-3 bg-green-600 rounded-full text-2xl text-white font-agency"
                  >
                    View Schedule
                  </motion.button>
                </Link>
              ) : (
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-3 bg-yellow-500 rounded-full text-2xl text-black font-agency"
                  >
                    Register Now
                  </motion.button>
                </Link>
              )}

              <Link
                href={constants.discordInvite}
                target="_blank"
                className="ml-0"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-3 bg-blue-500 rounded-full text-2xl font-agency text-white flex items-center space-x-2"
                >
                  <span>Discord</span>
                  <IconBrandDiscord />
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

        </section>

      </div>
    </motion.div>
  );
}
