import { handle } from "hono/vercel";
import { NextResponse } from "next/server";
import { z, createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'

const app = new OpenAPIHono()

.all("/", () => {
  return NextResponse.next();
})

.use("/*", async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  c.header("X-Response-Time", `${ms}ms`);
})

.all("/:user/:jwsk?", async (c) => {
  const { user, jwsk } = c.req.param();
  const url = c.req.url;
  const host = c.req.header("Host");
  const path = c.req.path;
  const id = c.req.query("id");

  const data = {
    id: url,
    publicName: user,
    assetCode: "XRP",
    assetScale: 2,
    authServer: `https://auth.${host}`,
  };

  if (
    path.startsWith("/_next") ||
    path.startsWith("/profile") ||
    path.startsWith("/api") ||
    path.startsWith("/doc") ||
    path.startsWith("/test")
  ) {
    return NextResponse.next();
  }

  if (jwsk?.startsWith("jwks")) {
    return c.json({
      keys: [
        {
          kid: id,
          alg: "EdDSA",
          kty: "OKP",
          crv: "Ed25519",
          x: user,
        },
      ],
    });
  }

  c.header("PayID", `${user}$${host}: ${id}`);
  c.header("Content-Type", "application/json");
  return c.json(data);
})

export const middleware = handle(app);

export const config = { matcher: "/((?!.*\\.).*)" };
