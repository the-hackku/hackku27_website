import { drizzle } from "drizzle-orm/bun-sql";
import { relations } from "@/db/relations";

const db = drizzle({ connection: process.env.DATABASE_URL, relations });

export { db };
