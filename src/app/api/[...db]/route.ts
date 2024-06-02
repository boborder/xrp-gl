import { Hono } from "hono";
import { handle } from "hono/vercel";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { serial, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";

const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  value: text("value").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

const app = new Hono().basePath("/api");

app.get("/get", async (c) => {
  const name = c.req.query("name");
  c.header("Content-Type", "application/json");

  if (name === undefined) {
    return c.json({ error: "Name and id are required" }, 400);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const db = drizzle(pool);
  try {
    const result = await db.select().from(users).where(eq(users.name, name!));
    return c.json(result);

  } catch (error) {
    return c.json({ error: "Insert failed" }, 500);

  } finally {
    await pool.end();
  }
});

app.get("/:account", async (c) => {
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
        value: account,
      })
      .returning()
      .execute();
    return c.json(result);

  } catch (error) {
    return c.json({ error: "Insert failed" }, 500);

  } finally {
    await pool.end();
  }
});

app.post("/post", async (c) => {
  const { name, value } = await c.req.json();
  if (!name || value === undefined) {
    return c.json({ error: "Name and value are required" }, 400);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const db = drizzle(pool);

  try {
    const result = await db
      .insert(users)
      .values({
        name: name,
        value: value,
      })
      .returning()
      .execute();
    return c.json(result);

  } catch (error) {
    return c.json({ error: "Insert failed" }, 500);

  } finally {
    await pool.end();
  }
});

export const GET = handle(app);
export const POST = handle(app);

export const runtime = "edge";
