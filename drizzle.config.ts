import { defineConfig } from "drizzle-kit";

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
