import { NextResponse } from "next/server";
import { handle } from "hono/vercel";
import { OpenAPIHono } from "@hono/zod-openapi";
import { logger } from 'hono/logger'
import { swaggerUI } from "@hono/swagger-ui";
import { prettyJSON } from 'hono/pretty-json'
import { secureHeaders } from 'hono/secure-headers'
import { schema } from "./scheme";
import * as utils from "@paystring/utils";
import { exportJWK, generateKeyPair } from "jose";
import { ECDSA, Wallet } from "xrpl";

const app = new OpenAPIHono()

  .openapi(schema, async (c) => {
    const param = c.req.valid("param");
    const schema = c.req.valid("json")
    return c.json({ result: {
      id: param.id,
      name: schema.name ,
      uuid: crypto.randomUUID(),
      ed25519: {...Wallet.generate(ECDSA.ed25519),} }});
  })
  .doc("/specification", {
    openapi: "3.1.0",
    info: {
      title: "API",
      version: "1.0.0",
    },
  })
  .get("/doc", swaggerUI({ url: "/specification" }))
  // .use(secureHeaders())
  .use(prettyJSON()) //?pretty
  // .use(logger())
  .use("/*", async (c, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    c.header("X-Response-Time", `${ms}ms`);
    c.header("payId-version", "1.0");
  })

  .all("/:user?/:jwks?", async (c) => {
    const { user, jwks } = c.req.param();
    const url = c.req.url;
    const path = c.req.path;
    if (
      path === "/" ||
      path.startsWith("/_next") ||
      path.startsWith("/profile") ||
      path.startsWith("/api") ||
      path.startsWith("/test")
    ) {
      return NextResponse.next();
    }

    try {
      const response = await fetch(
        `${process.env.API}/get?name=${user}`
      );
      const account = await response.json();
      console.log("done!? " + await account.result?.done);

      // accountが存在し、空のオブジェクトでない場合
      if (account && account !== "{}") {
        // if (account && account !== "{}" && account.result?.done === true) {
        const payString = utils.convertUrlToPayString("https://xrp.gl/" + user);

        const address: utils.Address = {
          environment: "TESTNET",
          paymentNetwork: "XRPL",
          addressDetailsType: utils.AddressDetailsType.CryptoAddress,
          addressDetails: { address: account.result?.account as string },
        };

        const { publicKey, privateKey } = await generateKeyPair("ES256", {
          extractable: true,
        });

        const pk = await exportJWK(publicKey);
        // console.log(pk)
        const key = await exportJWK(privateKey);
        key.alg = "ES256";

        const signingParameters = new utils.IdentityKeySigningParams(
          key,
          utils.getDefaultAlgorithm(key)
        );

        // 署名キーを使用して署名済み/検証済みアドレスを生成
        const verifiedAddress = await utils.sign(
          payString,
          address,
          signingParameters
        );

        // 検証済みアドレスを含むPaymentInfoを構築
        const paymentInfo = {
          payId: payString,
          addresses: [],
          verifiedAddresses: [verifiedAddress],
        };

        // PaymentInfoオブジェクト内のすべてのverifiedAddressesの署名を検証
        // console.log("verified address " + await utils.verifyPayString(paymentInfo));

        // // 特定のverifiedAddressを検証
        // utils.verifySignedAddress(payString, paymentInfo.verifiedAddresses[0]);

        // 署名に関する詳細情報をPaymentInfoから検査
        // const inspector = new utils.PaymentInformationInspector();
        // console.log(await inspector.inspect(paymentInfo));

        if (jwks && jwks?.startsWith("jwks")) {
          // 最初のverifiedAddressの最初の署名の公開鍵を抽出
          return c.json(await utils.getJwkFromRecipient(paymentInfo.verifiedAddresses[0].signatures[0]));
        }

        return c.json(paymentInfo);
      }

      return NextResponse.next();

    } catch (error) {
      console.error("error:", error);
      return NextResponse.error();
    }
  });

export const middleware = handle(app);

export const config = { matcher: "/((?!.*\\.(?!json$)[^.]+$).*)" };
