import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  dialect: "postgresql",
  schema: "src/db/schema.ts",
  out: "src/db/drizzle",
  migrations: {
    table: "users",
    schema: "public",
  },
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
