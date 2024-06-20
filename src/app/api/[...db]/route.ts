import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { handle } from "hono/vercel";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq } from "drizzle-orm";
import { users, InsUsers, SelUsers } from "@/db/schema";

const app = new Hono().basePath("/api")

.get("/get", async (c) => {
  const { name, account } = c.req.query();
  c.header("Content-Type", "application/json");

  if (!account && !name) {
    return c.json({ error: "Account or Name are required" }, 400);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const db = drizzle(pool);
  try {
    if (account) {
      const getAccount: SelUsers[] = await db
        .select()
        .from(users)
        .where(eq(users.account, account));
      return c.json({ result: getAccount[0] });
    }
    else if (name) {
      const getName: SelUsers[] = await db
        .select()
        .from(users)
        .where(eq(users.name, name));
      return c.json({ result: getName[0] });
    }
  } catch (error) {
    return c.json({ error: "Insert failed" }, 500);
  } finally {
    await pool.end();
  }
})

.get("/:account", bearerAuth({ token: process.env.TOKEN! }), async (c) => {
  const account = c.req.param("account");
  const name = c.req.query("name");
  c.header("X-Message", `${name}: ${account}`);
  c.header("Content-Type", "application/json");

  if (!account) {
    return c.json({ error: "Account are required" }, 400);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const db = drizzle(pool);

  try {
    const newUser: InsUsers = {
      name: name,
      account: account,
    };
    const res = {
      uuid: users.uuid,
      account: users.account,
    };

    const result: { uuid: string; account: string }[] = await db
      .insert(users)
      .values(newUser)
      .returning(res)
      .execute();
    return c.json({ result: result[0] });
  } catch (error) {
    return c.json({ error: "Insert failed" }, 500);
  } finally {
    await pool.end();
  }
})

.post("/:account", bearerAuth({ token: process.env.TOKEN! }), async (c) => {
  const account = c.req.param("account");
  const {
    age,
    avatar,
    bio,
    currency,
    country,
    did,
    email,
    gender,
    job,
    lang,
    locate,
    name,
    paystring,
    url,
    tel,
    sns,
  } = await c.req.json();
  c.header("Content-Type", "application/json");
  if (!account) {
    return c.json({ error: "Account are required" }, 400);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const db = drizzle(pool);

  try {
    const newUser: InsUsers = {
      account: account,
      age: age,
      avatar: avatar,
      bio: bio,
      currency: currency,
      country: country,
      did: did,
      email: email,
      gender: gender,
      job: job,
      lang: lang,
      locate: locate,
      name: name.toLowerCase(),
      paystring: paystring,
      url: url,
      tel: tel,
      sns: sns,
    };

    const res = {
      account: users.account,
      age: users.age,
      avatar: users.avatar,
      bio: users.bio,
      currency: users.currency,
      country: users.country,
      did: users.did,
      email: users.email,
      gender: users.gender,
      job: users.job,
      lang: users.lang,
      locate: users.locate,
      name: users.name,
      paystring: users.paystring,
      url: users.url,
      uuid: users.uuid,
      tel: users.tel,
      sns: users.sns,
      done: users.done,
      created_at: users.created_at,
    };

    const result: InsUsers[] = await db
      .insert(users)
      .values(newUser)
      .returning(res)
      .execute();
    return c.json({ result: result[0] });
  } catch (error) {
    return c.json({ error: "Insert failed" }, 500);
  } finally {
    await pool.end();
  }
})

.put("/:account", bearerAuth({ token: process.env.TOKEN! }), async (c) => {
  const account = c.req.param("account");
  const {
    // account,
    age,
    avatar,
    bio,
    currency,
    country,
    did,
    email,
    gender,
    job,
    lang,
    locate,
    name,
    paystring,
    url,
    tel,
    sns,
  } = await c.req.json();
  c.header("Content-Type", "application/json");
  if (!account) {
    return c.json({ error: "Account are required" }, 400);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const db = drizzle(pool);

  try {
    const newUser: InsUsers = {
      account: account,
      age: age,
      avatar: avatar,
      bio: bio,
      currency: currency,
      country: country,
      did: did,
      email: email,
      gender: gender,
      job: job,
      lang: lang,
      locate: locate,
      name: name.toLowerCase(),
      paystring: paystring,
      url: url,
      tel: tel,
      sns: sns,
    };

    const res = {
      account: users.account,
      age: users.age,
      avatar: users.avatar,
      bio: users.bio,
      currency: users.currency,
      country: users.country,
      did: users.did,
      email: users.email,
      gender: users.gender,
      job: users.job,
      lang: users.lang,
      locate: users.locate,
      name: users.name,
      paystring: users.paystring,
      url: users.url,
      uuid: users.uuid,
      tel: users.tel,
      sns: users.sns,
      done: users.done,
      created_at: users.created_at,
    };

    const result: InsUsers[] = await db
      .update(users)
      .set(newUser)
      .where(eq(users.account, account))
      .returning(res)
      .execute();
    return c.json({ result: result[0] });
  } catch (error) {
    return c.json({ error: "Insert failed" }, 500);
  } finally {
    await pool.end();
  }
})

export const POST = handle(app);
export const GET = handle(app);
export const PUT = handle(app);

export const runtime = "edge";
