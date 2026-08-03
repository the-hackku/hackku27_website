import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  BETTER_AUTH_URL: z.url(),
  BETTER_AUTH_SECRET: z.string(),
  BLOB_READ_WRITE_TOKEN: z.string(),
  AUTH_RESEND_KEY: z.string(),
  AUTH_GOOGLE_ID: z.string(),
  AUTH_GOOGLE_SECRET: z.string(),
  AUTH_GITHUB_ID: z.string(),
  AUTH_GITHUB_SECRET: z.string(),
  AUTH_DISCORD_ID: z.string(),
  AUTH_DISCORD_SECRET: z.string(),
  AUTH_MYMLH_ID: z.string(),
  AUTH_MYMLH_SECRET: z.string(),
  DIRECT_URL: z.url(),
  DATABASE_URL: z.url(),
});

export type Env = z.infer<typeof envSchema>;

// Works seamlessly in Bun locally and Node.js on Vercel
export const env = envSchema.parse(process.env);
