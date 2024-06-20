import { db, pool } from "./db";
import { migrate } from "drizzle-orm/neon-serverless/migrator";

export const migration = async () => {;
  try {
    console.log(await migrate(db, { migrationsFolder: "src/db/drizzle" }));
    console.log("Migration complete");
  } catch (error) {
    console.log(error);
  } finally {
    await pool.end()
  }
  process.exit(0);
};
migration();
