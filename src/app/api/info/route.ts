import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const request = await req.json();
    if (!request || Object.keys(request).length === 0 || !request.account) {
      return NextResponse.json({
        status: 400,
        message: "Bad Request: Empty or Invalid Request",
      });
    }

    const account = await request.account;
    const json = { method: "account_info", params: [{ account: account }] };

    const response = await fetch("https://xrplcluster.com", {
    // const check = await fetch("http://localhost:5005", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json),
    });

    const info = await response.json();
    console.log(info.result.status);

    return NextResponse.json(info.result);

  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json({ status: 500, message: "Internal Server Error" });
  }
}

export const runtime = "edge";
