import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Passkey from "next-auth/providers/passkey";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import DiscordProvider from "next-auth/providers/discord";
import ResendProvider from "next-auth/providers/resend";
import { cookies } from "next/headers";
import { htmlTemplate } from "@/utils/htmltemplate";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  experimental: { enableWebAuthn: true},
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
    Passkey,
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    DiscordProvider({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
      authorization: {
        params: {
          scope: "identify email guilds"
        }
      }
    }),
    {
      id: "mymlh",
      name: "MyMLH",
      type: "oauth",
      authorization: {
        url: "https://www.mlh.com/oauth/authorize",
        params: {
          scope: "public user:read:email user:read:phone user:read:demographics user:read:education user:read:profile user:read:event_preferences"
        }
      },
      token: "https://my.mlh.io/oauth/token",
      userinfo: "https://api.mlh.com/v4/users/me",
      profile(profile) {
        return {
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          name: `${profile.first_name} ${profile.last_name}`,
          email: profile.email,
          image: profile.avatar_url,
          role: "HACKER",
          multiFactorEnabled: false,
          phone_number: profile.phone_number,
          profile: {
            country_of_residence: profile.country_of_residence || null,
            race_or_ethnicity: profile.race_or_ethnicity || null,
            gender: profile.gender || null,
            age: profile.age || null,
          },
          education: profile.education || null
        }
      }
    }
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.role = user.role || "HACKER";
        session.user.multiFactorEnabled = user.multiFactorEnabled || false;
        if (session.user.multiFactorEnabled) {
          const cookieStore = await cookies();
          const sessionToken = cookieStore.get("authjs.session-token")?.value || cookieStore.get("__Secure-authjs.session-token")?.value;
          if (sessionToken) {
            const dbSession = await prisma.session.findUnique({
              where: { sessionToken },
              include: { user: true },
            });
            if (dbSession) {
              session.user.mfaVerified = dbSession.mfaVerified;
            } else {
              session.user.mfaVerified = false;
            }
          }
        }
      }
      return session;
    },
  },
  events: {
    async linkAccount( { user, account, profile }) {
      if (account.provider === "mymlh") {
        console.log("MyMLH account linked for user:", user.email);
        if (!user.id) return; // Shouldn't happen, but silences TypeScript
        console.log("MyMLH profile data:", profile);
        let school, major = null;
        if (profile.education && profile.education.length > 0) {
          const currentEducation = profile.education.find((edu: any) => edu.current);
          if (currentEducation) {
            school = currentEducation.school_name || null;
            major = currentEducation.major || null;
          }
        }
        await prisma.prefillData.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            firstName: profile.first_name ?? null,
            lastName: profile.last_name ?? null,
            phoneNumber: profile.phone_number ?? null,
            age: profile.profile?.age ?? null,
            countryOfResidence: profile.profile?.country_of_residence ?? null,
            currentSchool: school,
            major: major,
            race: profile.profile?.race_or_ethnicity ?? null
          },
          update: {
            firstName: profile.first_name ?? null,
            lastName: profile.last_name ?? null,
            phoneNumber: profile.phone_number ?? null,
            age: profile.profile?.age ?? null,
            countryOfResidence: profile.profile?.country_of_residence ?? null,
            currentSchool: school,
            major: major,
            race: profile.profile?.race_or_ethnicity ?? null
          }
        });
      }
    }
  },
  pages: {
    signIn: "/signin",
  },
  logger: {
    warn(code) {
      if (code === "experimental-webauthn") return; // We acknowledge this is experimental
      console.warn(code);
    }
  }
});