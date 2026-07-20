import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { genericOAuth, magicLink, twoFactor, admin } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey"
import { prisma } from "@/lib/prisma";
import { jsx } from 'react/jsx-runtime'
import { resend } from "@/lib/resend";
import MagicLink from "@/components/email/MagicLink";

export const auth = betterAuth({
  appName: "HackKU",
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
  account: {
    accountLinking: {
      disableImplicitLinking: true
    }
  },
  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      mapProfileToUser: async (profile) => {
        return {
          name: profile.name,
          email: profile.email,
          prefillData: {
            firstName: profile.given_name,
            lastName: profile.family_name
          }
        }
      }
    },
    github: {
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      mapProfileToUser: async (profile) => {
        let firstName = "";
        let lastName = "";
        if (profile.name) {
          const cleanName = profile.name.trim();
          const firstSpace = cleanName.indexOf(" ");
          if (firstSpace === -1) {
            firstName = cleanName;
          } else {
            firstName = cleanName.slice(0, firstSpace + 1)
            lastName = cleanName.slice(firstSpace + 1)
          }
        }
        return {
          name: profile.login,
          email: profile.email ?? `${profile.id}@placeholder.github.com`,
          prefillData: {
            firstName: firstName,
            lastName: lastName
          }
        }
      }
    },
    discord: {
      clientId: process.env.AUTH_DISCORD_ID!,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
      scope: ["identify", "email", "guilds"],
      mapProfileToUser: async (profile) => {
        return {
          name: profile.username,
          email: profile.email ?? `${profile.id}@placeholder.discord.com`,
        }
      }
    }
  },
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "mymlh",
          clientId: process.env.MYMLH_CLIENT_ID!,
          clientSecret: process.env.MYMLH_CLIENT_SECRET!,
          authorizationUrl: "https://my.mlh.io/oauth/authorize",
          tokenUrl: "https://my.mlh.io/oauth/token",
          userInfoUrl: "https://api.mlh.com/v4/users/me?expand[]=education",
          mapProfileToUser: async (profile) => {
            let school_name = null;
            let major = null;
            if (profile.education?.length > 0) {
              const currentEducation = profile.education.find(
                (edu: any) => edu.current,
              );
              if (currentEducation) {
                school_name = currentEducation.school_name || null;
                major = currentEducation.major || null;
              }
            }
            return {
              name: profile.first_name + " " + profile.last_name,
              email: profile.email,
              prefillData: {
                firstName: profile.first_name,
                lastName: profile.last_name,
                phoneNumber: profile.phone_number.slice(1) ?? null,
                age: profile.profile?.age ?? null,
                genderIdentity: profile.profile?.gender ?? null,
                countryOfResidence: profile.profile?.country_of_residence ?? null,
                currentSchool: school_name,
                major: major
              }
            }
          }
        }
      ]
    }),
    magicLink({
      expiresIn: 900, // 15 minutes
      sendMagicLink: async ({ email, url }) => {
        await resend.emails.send({
          from: "signin@auth.hackku.org",
          to: email,
          subject: "Your HackKU Sign-In Link",
          react: jsx(MagicLink, { url: url })
        })
      }
    }),
    twoFactor({
      allowPasswordless: true
    }),
    passkey({
      rpID: "hackku.org",
      rpName: "HackKU"
    }),
    admin({
      defaultRole: "participant"
    })
  ],
  onAPIError: {
    errorURL: "/auth-error"
  }
});
