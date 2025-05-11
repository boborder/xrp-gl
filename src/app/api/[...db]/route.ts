import { bearerAuth } from "hono/bearer-auth";
import { handle } from "hono/vercel";
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq } from "drizzle-orm";
import { users, InsUsers, SelUsers } from "@/db/schema";
import { schema } from "./scheme";

const app = new OpenAPIHono()
  .openapi(schema, async (c) => {
    const body = c.req.valid("json");
    return c.json({
      result: {
        name: body.name,
        uuid: crypto.randomUUID(),
      },
    });
  })
  .doc("/api/specification", {
    openapi: "3.1.0",
    info: {
      title: "API",
      version: "1.0.0",
    },
  })
  .get("/api/doc", swaggerUI({ url: "/api/specification" }))

  .get("/api/get", async (c) => {
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
      } else if (name) {
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

  .get("/api/:account", bearerAuth({ token: process.env.TOKEN! }), async (c) => {
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

  .post("/api/:account", bearerAuth({ token: process.env.TOKEN! }), async (c) => {
    const account = c.req.param("account");
    const data = await c.req.json();
    console.log(await data);
    c.header("Content-Type", "application/json");
    if (!account) {
      return c.json({ error: "Account are required" }, 400);
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
    const db = drizzle(pool);

    try {
      const newUser: InsUsers = {
        account: data.account,
        name: data.name.toLowerCase(),
      };

      const result: InsUsers[] = await db
        .insert(users)
        .values(newUser)
        .returning()
        .execute();
      return c.json({ result: result[0] });
    } catch (error) {
      return c.json({ error: "Insert failed" }, 500);
    } finally {
      await pool.end();
    }
  })

  .put("/api/:account", bearerAuth({ token: process.env.TOKEN! }), async (c) => {
    const account = c.req.param("account");
    const data = await c.req.json();
    c.header("Content-Type", "application/json");
    if (!account) {
      return c.json({ error: "Account are required" }, 400);
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
    const db = drizzle(pool);

    try {
      const newUser: InsUsers = {
        ...data,
        name: data.name.toLowerCase(),
      };

      const result: InsUsers[] = await db
        .update(users)
        .set(newUser)
        .where(eq(users.account, account))
        .returning()
        .execute();
      return c.json({ result: result[0] });
    } catch (error) {
      return c.json({ error: "Insert failed" }, 500);
    } finally {
      await pool.end();
    }
  });

export const POST = handle(app);
export const GET = handle(app);
export const PUT = handle(app);

// export const runtime = "edge";
