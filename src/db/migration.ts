import { db } from "./db";
import { migrate } from "drizzle-orm/neon-serverless/migrator";

export const migration = async () => {;
  try {
    await migrate(db, { migrationsFolder: "src/db/drizzle" });
    console.log("Migration complete");
  } catch (error) {
    console.log(error);
  }
  process.exit(0);
};
migration();
