import { Hono } from "hono";
import { handle } from "hono/vercel";

const app = new Hono().basePath("/api/pinata");

app.post("/", async (c) => {
  const data = await c.req.formData();
  // const body = await c.req.parseBody();
  // const file = body["file"] as File;
  const file: File | null = data.get("file") as unknown as File;
  data.append("pinataMetadata", JSON.stringify({ name: file.name }));
  data.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));
  try {
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: data,
    });

    const { IpfsHash } = await res.json() as any;
    console.log(IpfsHash);
    return c.json(IpfsHash);
  } catch (error) {
    return c.json({ error: "Internal Server Error" }, 500);
  }
});
export const POST = handle(app);

export const runtime = "edge";
