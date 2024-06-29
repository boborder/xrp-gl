import { Hono } from "hono";
import { handle } from "hono/vercel";

const app = new Hono().basePath("/api/info");

app.post("/", async (c) => {
  const req = await c.req.json();
  const account = req.account;
  const network =
    req.network?.replace("wss", "https").replace("51233", "51234") ||
    "https://xrplcluster.com";

  const options = req.options || [];

  const requests = {
    info: {
      method: "account_info",
      params: [{ account: account }],
    },
    obj: {
      method: "account_objects",
      params: [{ account: account }],
    },
    nft: {
      method: "account_nfts",
      params: [{ account: account }],
    },
    channel: {
      method: "account_channels",
      params: [{ account: account }],
    },
    currency: {
      method: "account_currencies",
      params: [{ account: account }],
    },
    line: {
      method: "account_lines",
      params: [{ account: account }],
    },
    offer: {
      method: "account_offers",
      params: [{ account: account }],
    },
    tx: {
      method: "account_tx",
      params: [{ account: account, ledger_index_max: -1, limit: 1 }],
    },
  };

  const dig = async (json: any) => {
    if (json) {
      try {
        const res = await fetch(network, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(json),
        });
        return await res.json();
      } catch (error) {
        return c.json({ error: "Internal Server Error" }, 500);
      }
    }
  };

  const results: Record<string, any> = {};

  // デフォルトで全ての情報を取得するように設定
  const finalOptions = options.length === 0 ? Object.keys(requests) : options;

  for (const option of finalOptions) {
    if (option in requests) {
      const request = requests[option as keyof typeof requests];
      results[option] = await dig(request);
    }
  }

  return c.json(
    Object.fromEntries(
      Object.entries(results).map(([key, value]) => [key, value.result])
    )
  );
});

export const POST = handle(app);

export const runtime = "edge";
