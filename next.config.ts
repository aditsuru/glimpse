import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
	images: {
		unoptimized: isDev,
		remotePatterns: [
			{
				protocol: "https",
				hostname: "ik.imagekit.io",
				pathname: "/aditsuru/**",
			},
		],
	},
};

export default nextConfig;
