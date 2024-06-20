import { handle } from "hono/vercel";
import { NextResponse } from "next/server";
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { schema } from "./scheme";
import * as utils from "@paystring/utils";
import { exportJWK, generateKeyPair } from "jose";

const app = new OpenAPIHono()

  .openapi(schema, async (c) => {
    const param = c.req.valid("param");
    return c.json({ result: { id: param.id } });
  })
  .doc("/specification", {
    openapi: "3.1.0",
    info: {
      title: "API",
      version: "1.0.0",
    },
  })
  .get("/doc", swaggerUI({ url: "/specification" }))

  .use("/*", async (c, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    c.header("X-Response-Time", `${ms}ms`);
    c.header("payId-version", "1.0");
  })

  .all("/:user?/:jwsk?", async (c) => {
    const { user, jwsk } = c.req.param();
    const url = c.req.url
    const host = c.req.header("host");
    const path = c.req.path;
    const id = c.req.query("id")


    if (
        path === "/" ||
        path.startsWith("/_next") ||
        path.startsWith("/favicon") ||
        path.startsWith("/ipfs") ||
        path.startsWith("/api") ||
        path.startsWith("/profile") ||
        path.startsWith("/test")
      ) {
        return NextResponse.next();
      }

    const account = await (
      await fetch(
        `http://${host}/api/get?name=${user}`
      )
    ).json();
    // console.log(account.result);

    // accountが存在し、空のオブジェクトでない場合
    if (account && account !== "{}") {
    // if (account && account !== "{}" && account.result?.done === true) {
      const payString = utils.convertUrlToPayString(
        "https://xrp.gl/" + user
      );

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
      utils.verifyPayString(paymentInfo);

      // // 特定のverifiedAddressを検証
      // utils.verifySignedAddress(payString, paymentInfo.verifiedAddresses[0]);

      // 署名に関する詳細情報をPaymentInfoから検査
      const inspector = new utils.PaymentInformationInspector();
      inspector.inspect(paymentInfo);

      // 最初のverifiedAddressの最初の署名の公開鍵を抽出
      // utils.getJwkFromRecipient(paymentInfo.verifiedAddresses[0].signatures[0]);

      if (jwsk && jwsk?.startsWith("jwsk")) {
        return c.json(pk);
      }
      c.header("Content-Type", "application/json");
      return c.json(paymentInfo);
    }

    return NextResponse.next();
  });

export const middleware = handle(app);

export const config = { matcher: "/((?!.*\\.(?!json$)[^.]+$).*)" };
