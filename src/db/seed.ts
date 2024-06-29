import { Wallet } from "xrpl";
import { db, pool } from "./db";
import { users } from "./schema";

const seed = async () => {
  await db.insert(users).values([
    {
      name: "alice",
      account: Wallet.generate().address,
      email: "alice@gmail.com"
    },
    {
      name: "bob",
      account: Wallet.generate().address,
      avatar: "https://avatar.com/bob.png"
    },
    {
      name: "cat",
      account: Wallet.generate().address,
      age: "13"
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
