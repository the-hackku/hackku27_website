import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import DiscordProvider from "next-auth/providers/discord";
import ResendProvider from "next-auth/providers/resend";
import { htmlTemplate } from "@/utils/htmltemplate";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    ResendProvider({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: "HackKU <signin@auth.hackku.org>",
      maxAge: 5 * 60, // Token expires after 5 minutes
      sendVerificationRequest: async ({ identifier: toEmail, url, provider }) => {
        const { host } = new URL(url);

        const messages = [
          "Click the button below to sign in:",
          "Here is your secure sign-in link:",
          "Access your HackKU account by clicking below:",
          "To continue, click the sign-in button:",
        ];
        const subjects = [
          "Your HackKU Sign-in Link 🔑",
          "Secure Login for HackKU",
          "Sign in to HackKU Now",
          "Your HackKU Access Link",
        ];

        const timestamp = new Date().toLocaleString("en-US", {
          timeZone: "America/Chicago",
        });
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
        const randomizedUrl = `${url}&t=${Date.now()}`;

        const htmlBody = htmlTemplate(randomizedUrl, host, randomMessage, timestamp);

        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.AUTH_RESEND_KEY || provider.apiKey}`,
            },
            body: JSON.stringify({
              from: provider.from,
              to: toEmail,
              subject: randomSubject,
              html: htmlBody
            }),
          });

          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Resend API response failure: ${errorText}`);
          }
          console.log("Magic link verification email sent to:", toEmail);
        } catch (error) {
          console.error("Error delivering email via Resend API:", error);
          throw new Error("Failed to deliver verification email.");
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ account, profile, user }) {
      console.log("signIn callback triggered with:", { account, profile, user });
      if (!account) return true;

      if (account.provider !== "resend") {
        const userEmail = user.email ?? profile?.email;
        if (!userEmail || typeof userEmail !== "string") return false;

        const existingUser = await prisma.user.findUnique({
          where: { email: userEmail },
          include: { accounts: true },
        });
        if (existingUser) {
          const linkedAccount = existingUser.accounts.find(
            (acc) => acc.provider === account.provider
          );

          if (!linkedAccount) {
            // Links new OAuth identity directly to the established profile record
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                type: account.type,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
            });
            console.log(`✅ Linked ${account.provider} to existing user account record`);
          }
          return true;
        }
      }
      return true;
    },

    async session({ session, user }) {
      // In Auth.js v5 database sessions, user metadata passes directly into the user property parameter
      if (session.user && user) {
        session.user.id = user.id;
        session.user.role = (user as any).role || "HACKER"; // Falls back safely to HACKER role defaults
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
});