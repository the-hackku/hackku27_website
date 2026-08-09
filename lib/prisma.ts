import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/prisma/generated/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prismaClientSingleton = () => {
  return new PrismaClient({
    adapter,
    log: ["query", "info", "warn", "error"],
  });
};

const prisma: ReturnType<typeof prismaClientSingleton> =
  globalThis.prismaGlobal ?? prismaClientSingleton();

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Reuses the same client across hot reloads in a development environment
if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export { prisma };
