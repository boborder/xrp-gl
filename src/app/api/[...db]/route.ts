import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { handle } from "hono/vercel";
import { Client, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";

const app = new Hono().basePath("/api");

app.get("/get", async (c) => {
  const { name, account } = c.req.query();
  c.header("Content-Type", "application/json");

  if (!account) {
    return c.json({ error: "Account are required" }, 400);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const db = drizzle(pool);
  try {
    if (account) {
      const getAccount = await db
      .select()
      .from(users)
      .where(eq(users.account, account));
      if (name) {
        const getName = await db
          .select()
          .from(users)
          .where(eq(users.name, name));
        return c.json({ getAccount, getName });
      }
      return c.json({ getAccount });
    }
  } catch (error) {
    return c.json({ error: "Insert failed" }, 500);
  } finally {
    await pool.end();
  }
});

app.get("/:account", bearerAuth({ token: process.env.TOKEN! }), async (c) => {
  const account = c.req.param("account");
  const name = c.req.query("name");
  c.header("X-Message", `${name}: ${account}`);
  c.header("Content-Type", "application/json");

  if (!account || name === undefined) {
    return c.json({ error: "Name and id are required" }, 400);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const db = drizzle(pool);

  try {
    const result = await db
      .insert(users)
      .values({
        name: name,
        account: account,
      })
      .returning()
      .execute();
    return c.json(result[0]);
  } catch (error) {
    return c.json({ error: "Insert failed" }, 500);
  } finally {
    await pool.end();
  }
});

app.post("/post", bearerAuth({ token: process.env.TOKEN! }), async (c) => {
  const {
    name,
    account,
    age,
    avatar,
    bio,
    currency,
    country,
    did,
    gender,
    job,
    lang,
    locate,
    paystring,
    url,
    tel,
    sns,
  } = await c.req.json();
  if (!name || !account) {
    return c.json({ error: "Name and id are required" }, 400);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const db = drizzle(pool);

  try {
    const result: { uuid: string; account: string }[] = await db
      .insert(users)
      .values({
        name: name,
        account: account,
        age: age,
        avatar: avatar,
        bio: bio,
        currency: currency,
        country: country,
        did: did,
        gender: gender,
        job: job,
        lang: lang,
        locate: locate,
        paystring: paystring,
        url: url,
        tel: tel,
        sns: sns,
      })
      .returning({ uuid: users.uuid, account: users.account })
      .execute();
    return c.json(result[0]);
  } catch (error) {
    return c.json({ error: "Insert failed" }, 500);
  } finally {
    await pool.end();
  }
});

app.post("/set", bearerAuth({ token: process.env.TOKEN! }), async (c) => {
  const {
    name,
    account,
    age,
    avatar,
    bio,
    currency,
    country,
    did,
    gender,
    job,
    lang,
    locate,
    paystring,
    url,
    tel,
    sns,
  } = await c.req.json();
  if (!name || !account) {
    return c.json({ error: "Name and id are required" }, 400);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const db = drizzle(pool);

  try {
    const result = await db
      .update(users)
      .set({
        name: name,
        account: account,
        age: age,
        avatar: avatar,
        bio: bio,
        currency: currency,
        country: country,
        did: did,
        gender: gender,
        job: job,
        lang: lang,
        locate: locate,
        paystring: paystring,
        url: url,
        tel: tel,
        sns: sns,
      })
      .where(eq(users.account, account))
      .returning()
      .execute();
    return c.json(result[0]);
  } catch (error) {
    return c.json({ error: "Insert failed" }, 500);
  } finally {
    await pool.end();
  }
});

export const POST = handle(app);
export const GET = handle(app);

export const runtime = "edge";
