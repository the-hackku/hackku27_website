import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/providers/NextAuthProvider";
import HeaderWrapper from "@/components/HeaderWrapper";
import Footer from "@/components/Footer";
import { auth } from "@/auth";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/providers/ProgressBarProvider";
import { Analytics } from "@vercel/analytics/react";

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HackKU27",
  description: "The Official Website for HackKU 2027. Join us for a weekend of innovation, coding, and creativity at the University of Kansas!",
  icons: {
    // icon: "/images/branding/logo_white_bg.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning className={robotoMono.className}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <NextAuthProvider session={session}>
            <Providers>
              <div className="flex flex-col min-h-screen">
                <HeaderWrapper />
                <main className="flex-grow relative z-10">{children}</main>
                <Footer />
                <Toaster />
                <Analytics />
              </div>
            </Providers>
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
