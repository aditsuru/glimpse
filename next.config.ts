import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const hostname = process.env.NEXT_PUBLIC_APP_URL
	? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
	: "localhost";

const nextConfig: NextConfig = {
	allowedDevOrigins: [hostname],

	images: {
		unoptimized: isDev,
		remotePatterns: [
			{
				protocol: "https",
				hostname: "ik.imagekit.io",
				pathname: "/aditsuru/**",
			},
			// Add dev origin for storage (MinIO bucket)
			...(isDev
				? [
						{
							protocol: "http" as const,
							hostname: hostname,
							port: "9000",
							pathname: "/**",
						},
					]
				: []),
		],
	},
};

export default nextConfig;
