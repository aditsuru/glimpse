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
			{
				protocol: "https",
				hostname: "images.unsplash.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "i.redd.it",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "preview.redd.it",
				port: "",
				pathname: "/**",
			},
		],
	},
};

export default nextConfig;
