import { passkey } from "@better-auth/passkey";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { betterAuth } from "better-auth/minimal";
import {
  admin,
  customSession,
  emailOTP,
  genericOAuth,
  organization,
  twoFactor,
} from "better-auth/plugins";
import { forbidden, unauthorized } from "next/navigation";
import { jsx } from "react/jsx-runtime";
import MagicLink from "@/components/email/MagicLink";
import { ac, roles } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";

type PermissionMap = {
  [Resource in keyof typeof ac.statements]?: (typeof ac.statements)[Resource][number][];
};

export const auth = betterAuth({
  appName: "HackKU",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      prefillData: {
        type: "json",
        required: false,
        defaultValue: null,
        input: true,
      },
      isRegistered: {
        type: "boolean",
        required: true,
        input: false,
        defaultValue: false,
      },
      role: {
        type: "string",
        required: true,
        input: false,
        defaultValue: "HACKER",
      },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github", "discord", "mymlh"],
      // This is hooked to allow orphaned User records to be linked to a new account, but still blocks normal implicit linking.
      // This should be re-evaluated in the future when all users have a linked account.
      disableImplicitLinking: false,
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      mapProfileToUser: (profile) => {
        return {
          name: profile.name,
          email: profile.email,
          prefillData: {
            firstName: profile.given_name,
            lastName: profile.family_name,
          },
        };
      },
    },
    github: {
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      scope: ["user", "user:email"],
      mapProfileToUser: (profile) => {
        let firstName = "";
        let lastName = "";
        if (profile.name) {
          const cleanName = profile.name.trim();
          const firstSpace = cleanName.indexOf(" ");
          if (firstSpace === -1) {
            firstName = cleanName;
          } else {
            firstName = cleanName.slice(0, firstSpace + 1);
            lastName = cleanName.slice(firstSpace + 1);
          }
        }
        return {
          name: profile.login,
          email: profile.email ?? `${profile.id}@placeholder.github.com`,
          prefillData: {
            firstName,
            lastName,
          },
        };
      },
    },
    discord: {
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
      scope: ["identify", "email", "guilds"],
      mapProfileToUser: (profile) => {
        return {
          name: profile.username,
          email: profile.email ?? `${profile.id}@placeholder.discord.com`,
        };
      },
    },
  },
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "mymlh",
          clientId: process.env.AUTH_MYMLH_ID,
          clientSecret: process.env.AUTH_MYMLH_SECRET,
          authorizationUrl: "https://my.mlh.io/oauth/authorize",
          tokenUrl: "https://my.mlh.io/oauth/token",
          // biome-ignore lint/security/noSecrets: Just a URL, not a secret
          userInfoUrl: "https://api.mlh.com/v4/users/me?expand[]=education",
          mapProfileToUser: (profile) => {
            let school_name: string | null = null;
            let major: string | null = null;
            if (profile.education?.length > 0) {
              const currentEducation = profile.education.find(
                (edu: { current: boolean }) => edu.current,
              );
              if (currentEducation) {
                school_name = currentEducation.school_name || null;
                major = currentEducation.major || null;
              }
            }
            return {
              name: `${profile.first_name} ${profile.last_name}`,
              email: profile.email,
              prefillData: {
                firstName: profile.first_name,
                lastName: profile.last_name,
                phoneNumber: profile.phone_number.slice(1) ?? null,
                age: profile.profile?.age ?? null,
                genderIdentity: profile.profile?.gender ?? null,
                countryOfResidence:
                  profile.profile?.country_of_residence ?? null,
                currentSchool: school_name,
                major,
              },
            };
          },
        },
      ],
    }),
    emailOTP({
      expiresIn: 600, // 10 minutes
      sendVerificationOTP: async ({ email, otp }) => {
        await resend.emails.send({
          from: "signin@auth.hackku.org",
          to: email,
          subject: "Your HackKU Sign-In Link",
          react: jsx(MagicLink, { email, otp }),
        });
      },
    }),
    twoFactor({
      allowPasswordless: true,
    }),
    passkey({
      rpID: "hackku.org",
      rpName: "HackKU",
    }),
    // biome-ignore lint/suspicious/useAwait: Better Auth requires this to return a Promise
    customSession(async ({ user, session }) => {
      const typedUser = user as typeof user & {
        isRegistered: boolean;
        role: "HACKER" | "MENTOR" | "JUDGE" | "SPONSOR" | "VOLUNTEER" | "ADMIN";
      };
      return {
        session: {
          ...session,
          isRegistered: typedUser.isRegistered,
          role: typedUser.role,
        },
      };
    }),
    admin({
      ac,
      roles: {
        hacker: roles.hacker,
        mentor: roles.mentor,
        judge: roles.judge,
        bronze_sponsor: roles.bronze_sponsor,
        silver_sponsor: roles.silver_sponsor,
        gold_sponsor: roles.gold_sponsor,
        volunteer: roles.volunteer,
        writer: roles.writer,
        admin: roles.admin,
      },
      defaultRole: "hacker",
    }),
    organization({
      allowUserToCreateOrganization: true,
    }),
  ],
  onAPIError: {
    errorURL: "/auth-error",
  },
  databaseHooks: {
    account: {
      create: {
        before: async (account, ctx) => {
          // This is a temporary hook to allow orphaned User records to be linked to a new account, but still block normal implicit linking.
          if (ctx?.context.session) {
            return {
              data: {
                ...account,
              },
            };
          }
          const existingAccounts = await prisma.account.count({
            where: { userId: account.userId },
          });
          if (existingAccounts === 0) {
            return {
              data: {
                ...account,
              },
            };
          }
          throw new APIError("BAD_REQUEST", {
            message:
              "Please sign in with an account already that is already linked to your profile.",
          });
        },
      },
    },
  },
});

export async function hasPermissions(
  session: Awaited<ReturnType<typeof auth.api.getSession>>,
  resources: PermissionMap,
): Promise<boolean> {
  if (!session) {
    unauthorized();
  }
  const data = await auth.api.userHasPermission({
    body: {
      userId: session?.session.userId,
      permissions: resources,
    },
  });
  if (data.success) {
    return data.success;
  }
  forbidden();
}
