import { Wallet } from "xrpl";
import { db, pool } from "./db";
import { users } from "./schema";

const seed = async () => {
  await db.insert(users).values([
    {
      name: "Tanaka",
      account: Wallet.generate().address,
      email: "tanakakanant@gmail.com"
    },
    {
      name: "George",
      account: Wallet.generate().address,
      avatar: "https://avatar.com/avatar.png"
    },
    {
      name: "Katou",
      account: Wallet.generate().address,
      age: "33"
    },
  ]);
}

const main = async () => {
  try {
    await seed();
    console.log("Seeding completed");
    console.log(await db.select().from(users));
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  } finally {
    pool.end();
  }
}

main();
