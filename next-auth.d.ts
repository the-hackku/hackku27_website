// next-auth.d.ts
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from "next-auth";

// Extend the User and Session types in NextAuth
declare module "next-auth" {
  interface User {
    role: string;
    multiFactorEnabled: boolean;
    // MyMLH fields
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    profile?: {
      country_of_residence?: string;
      race_or_ethnicity?: string;
      gender?: string;
      age?: number;
    };
    education?: {
      current: boolean;
      school_name: string;
      major?: string;
    }[];
  }
  interface Session {
    user: {
      role: string;
      multiFactorEnabled: boolean;
    } & DefaultSession["user"]; // Extend default user properties (email, name, etc.)
  }
}
