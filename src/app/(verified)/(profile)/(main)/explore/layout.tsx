import type { Metadata } from "next";
import { buildMetadata } from "@/lib/shared/metadata";

export const metadata: Metadata = buildMetadata({
	title: "Explore",
	description: "Discover people on Glimpse.",
});

export default function Layout({ children }: { children: React.ReactNode }) {
	return children;
}
