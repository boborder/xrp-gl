/** @type {import('next').NextConfig} */

module.exports = {
  output: "standalone",
  images: {
    loader: "custom",
    unoptimized: true,
  },
  env: {
    XUMMAPI: process.env.XUMMAPI,
    XUMMSECRET: process.env.XUMMSECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    PINATA_API_KEY: process.env.PINATA_API_KEY,
    PINATA_API_SECRET: process.env.PINATA_API_SECRET,
    PINATA_JWT: process.env.PINATA_JWT,
  },
  async rewrites() {
    const gateway = "https://ipfs.io/ipfs/";
    const cid = "bafybeig3w3pnokgbxt55hcz5yv6o7b6calyjjfbl22qwnzpdjdzmzvj6xa";
    const ipfs = `${gateway}${cid}`;
    return [
      {
        source: "/ipfs/:file*",
        destination: `${ipfs}/:file*`,
      },
    ];
  },
  experimental: {
    typedRoutes: true,
    serverActions: true,
  },
};
