import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
	images: {
		unoptimized: isDev,
		remotePatterns: [
			{
				protocol: "http",
				hostname: "localhost",
				port: "9000",
				pathname: "/glimpse-dev/**",
			},
		],
	},
};

export default nextConfig;
