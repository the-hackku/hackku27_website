import { drizzle } from "drizzle-orm/node-postgres";
import { relations } from "@/db/relations";

const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  },
  relations,
});

export { db };
