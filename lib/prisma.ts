import { PrismaClient } from "@/prisma/generated/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

if (process.env.NODE_ENV !== "production") {
  neonConfig.fetchEndpoint = (host) => {
    return host.includes("localtest.me")
      ? `http://${host}:4444/sql`
      : `https://${host}/sql`;
  };
}

const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, {});
const prismaClientSingleton = () => {
  return new PrismaClient({
    adapter,
    log: ["query", "info", "warn", "error"],
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

// Reuses the same client across hot reloads in a development environment
if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
