import toml from "toml";
import { Hono } from "hono";
import { handle } from "hono/vercel";

const app = new Hono().basePath("/api/toml");

app.post("/", async (c) => {
  const Request = await c.req.json();
  if (!Request || Object.keys(Request).length === 0 || !Request.domain) {
    return c.json({ message: "Bad Request: Empty or Invalid Request" }, 400);
  }
  const domain = await Request.domain;

  try {
    const check = fetch(`https://${domain}/.well-known/xrp-ledger.toml`);
    const text = await (await check).text();
    const json = toml.parse(text);

    return c.json({ account: json["ACCOUNTS"] });
  } catch (error) {
    return c.json({ error: "Internal Server Error" }, 500);
  }
});
export const POST = handle(app);

export const runtime = "edge";
