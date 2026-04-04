import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "i.pinimg.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "video.twimg.com",
				port: "",
				pathname: "/**",
			},
		],
	},
};

export default nextConfig;
