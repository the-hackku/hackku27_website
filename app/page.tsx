"use client"

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function HomePage() { 
  const { data: session } = useSession();
  return ( 
    <div className="relative flex flex-col items-center justify-center -mt-[3.5vw]">
      <div className="relative z-10 flex flex-row items-center justify-center -mt-[0vw]">
        <div
            className="border-[.1vw] bg-[#ffffff] flex flex-col items-center justify-start gap-[1.2vw]"
          style={{
            borderRadius: "0 0 4vw 4vw",
            borderTopLeftRadius: "50% 2.7vw",
            borderTopRightRadius: "50% 2.7vw",
            width: "40vw",
            height: "15vw",
            minWidth: "480px",
          }}
        >
          <h1 className = "mt-[1.5vw] text-[1.8vw] font-bold">Welcome to Hack
            <span className="text-blue-500">{"K"}</span>
            <span className="text-red-500">{"U/"}</span>
            <span className="text-yellow-500">{">"}</span>
          </h1>
          <h3 className="text-[#666666] text-[1vw] mb-[.7vw]">
            {!session?.user.isRegistered ? "Glad to have you!" : "Thanks for registering! Check back later for updates."}
          </h3>

          {/* button holder */}
          <div className="flex w-full justify-between px-4 mt-auto mb-[1.5vw]">
            {/* Registration Button */}
            {!session?.user.isRegistered ? (
              <Link
                href="/register"
                className="group relative flex items-center justify-center overflow-hidden border-[.2vw] border-black/10
                 shadow-md transition-all duration-300 ease-out hover:-translate-y-1
                  hover:scale-[1.03] hover:shadow-xl cursor-pointer"
              style={{
                backgroundColor: "#f2a900",
                borderRadius: "1.5vw 1.5vw 1.5vw 4vw",
                width: "18.5vw",
                height: "5vw",
              }}
            >
              <span className="text-black font-semibold text-[.85vw] opacity-90 transition-opacity group-hover:opacity-100">
                Register Now
              </span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-300" />
            </Link>
            ) : (
              <button
              className="group relative flex items-center justify-center overflow-hidden border-[.2vw] border-black/10 , 
              shadow-md transition-all duration-300 ease-out hover:-translate-y-1 ,
               hover:scale-[1.03] hover:shadow-xl cursor-pointer"
              style={{
                backgroundColor: "#0edf2a",
                borderRadius: "1.5vw 1.5vw 1.5vw 4vw",
                width: "18.5vw",
                height: "5vw",
              }}
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <span className="text-white font-semibold text-[.85vw] opacity-90 transition-opacity group-hover:opacity-100">
                Sign Out
              </span>

              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-300" />
            </button>
            )}
              {/* This would be discord invite */}
            <button
              className="group relative flex items-center justify-center overflow-hidden border-[.2vw] border-black/10 , 
              shadow-md transition-all duration-300 ease-out hover:-translate-y-1 ,
               hover:scale-[1.03] hover:shadow-xl cursor-pointer"
              style={{
                backgroundColor: "#0051ba",
                borderRadius: "1.5vw 1.5vw 4vw 1.5vw",
                width: "18.5vw",
                height: "5vw",
              }}
            >
              <span className="text-white font-semibold text-[.85vw] opacity-90 transition-opacity group-hover:opacity-100">
                Learn More
              </span>

              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-300" />
            </button>

          </div>
        </div>
      </div>
    </div> 
  ); 
}