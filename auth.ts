import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { genericOAuth } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { htmlTemplate } from "@/utils/htmltemplate";

async function mergePrefillData(prefillData: Record<string, any>, )

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
      provider: "postgresql"
    }
  ),
  user: {
    additionalFields: {
      prefillData: {
        type: "json",
        required: false,
        defaultValue: null,
        input: true
      }
    }
  },
  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    },
    github: {
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    },
    discord: {
      clientId: process.env.AUTH_DISCORD_ID!,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
      scope: ["identify", "email", "guilds"]
    }
  },
  events: {
    async linkAccount({ user, account, profile }) {
      if (account.provider === "mymlh") {
        console.log("MyMLH account linked for user:", user.email);
        if (!user.id) return; // Shouldn't happen, but silences TypeScript
        console.log("MyMLH profile data:", profile);
        let school,
          major = null;
        if (profile.education && profile.education.length > 0) {
          const currentEducation = profile.education.find(
            (edu: any) => edu.current,
          );
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
            race: profile.profile?.race_or_ethnicity ?? null,
          },
          update: {
            firstName: profile.first_name ?? null,
            lastName: profile.last_name ?? null,
            phoneNumber: profile.phone_number ?? null,
            age: profile.profile?.age ?? null,
            countryOfResidence: profile.profile?.country_of_residence ?? null,
            currentSchool: school,
            major: major,
            race: profile.profile?.race_or_ethnicity ?? null,
          },
        });
      }
    },
  },
  pages: {
    signIn: "/signin",
  }
});
