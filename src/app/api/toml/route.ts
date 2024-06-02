import toml from "toml";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const Request = await req.json();
    if (!Request || Object.keys(Request).length === 0 || !Request.domain) {
      return NextResponse.json({
        status: 400,
        message: "Bad Request: Empty or Invalid Request",
      });
    }

    const domain = await Request.domain;

    const check = fetch(`https://${domain}/.well-known/xrp-ledger.toml`);
    const text = await (await check).text();
    const json = toml.parse(text);
    // console.log(json)

    return NextResponse.json({ account: json["ACCOUNTS"] });
    
  } catch (error) {
    console.error("An error occurred:", error);
    // Return a 500 Internal Server Error response
    return NextResponse.json({ status: 500, message: "Internal Server Error" });
  }
}
