import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	images: {
		loader: 'custom',
		unoptimized: true,
	},
	env: {
		XUMMAPI: process.env.XUMMAPI,
		XUMMSECRET: process.env.XUMMSECRET,
		DATABASE_URL: process.env.DATABASE_URL,
		PINATA_JWT: process.env.PINATA_JWT,
		TOKEN: process.env.TOKEN,
		SEED: process.env.SEED,
		API: process.env.API,
	}
};

export default nextConfig

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
initOpenNextCloudflareForDev()
