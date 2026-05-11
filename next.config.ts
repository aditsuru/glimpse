import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const appHostname = process.env.NEXT_PUBLIC_APP_URL
	? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
	: "localhost";

const r2Hostname = process.env.NEXT_PUBLIC_R2_PUBLIC_URL
	? new URL(process.env.NEXT_PUBLIC_R2_PUBLIC_URL).hostname
	: "localhost";

const nextConfig: NextConfig = {
	allowedDevOrigins: [appHostname],

	images: {
		unoptimized: isDev,
		remotePatterns: [
			// Local — MinIO
			...(isDev
				? [
						{
							protocol: "http" as const,
							hostname: r2Hostname,
							port: "9000",
							pathname: "/**",
						},
					]
				: [
						// Staging/Prod — Cloudflare R2
						{
							protocol: "https" as const,
							hostname: r2Hostname,
							pathname: "/**",
						},
					]),
		],
	},
};

export default nextConfig;
