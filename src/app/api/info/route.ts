import { Hono } from "hono";
import { handle } from "hono/vercel";

const app = new Hono().basePath("/api/info");

app.post("/", async (c) => {
  const req = await c.req.json();
  const account = req.account;
  const network = req.network?.replace("wss", "https").replace("51233", "51234");
  const json = { method: "account_info", params: [{ account: account }] };

  try {
    const info = await fetch(`${network || "https://xrplcluster.com"}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json),
    });

    const data: any = await info.json();
    console.log(data.result.status);
    return c.json(data.result);
  } catch (error) {
    return c.json({ error: "Internal Server Error" }, 500);
  }
});
export const POST = handle(app);

export const runtime = "edge";
