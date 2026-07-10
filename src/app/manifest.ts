import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Glimpse",
		short_name: "Glimpse",
		description:
			"Share moments, follow people, see what's trending. Glimpse is where it's happening right now.",
		start_url: "/",
		display: "standalone",
		background_color: "#000000",
		theme_color: "#000000",
		icons: [
			{
				src: "/static/logo.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/static/logo.png",
				sizes: "512x512",
				type: "image/png",
			},
		],
	};
}
