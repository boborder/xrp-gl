import { Hono } from "hono";
import { handle } from "hono/vercel";
import { NextResponse } from "next/server";

const app = new Hono();

app.all("/", () => {return NextResponse.next()})

app.use("/*", async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  c.header("X-Response-Time", `${ms}ms`);
});

app.all("/:user/:jwsk?", async (c) => {
  const {user, jwsk} = c.req.param();
  const path = c.req.path;
  const host = c.req.header("Host");
  const id = c.req.query("id");
  const url = c.req.url

  const data = {
    id: url,
    publicName: user,
    assetCode: "XRP",
    assetScale: 2,
    authServer: `https://auth.${host}`
  }

  if (
    // path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.startsWith("/test") ||
    path.startsWith("/profile")
  ) {
    return NextResponse.next();
  }

  if (jwsk?.startsWith("jwks")) {
    return c.json({"keys": [
      {
        "kid": "string",
        "alg": "EdDSA",
        "kty": "OKP",
        "crv": "Ed25519",
        "x": "string"
      }
    ]
  })
  }

  c.header("X-payment", `${user}$${host}: ${id}`);
  c.header("Content-Type", 'application/json');
  return c.json(data);
});

export const middleware = handle(app);

export const config = { matcher: "/((?!.*\\.).*)" };
