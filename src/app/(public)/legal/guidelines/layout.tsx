import type { Metadata } from "next";
import { buildMetadata } from "@/lib/shared/metadata";

export const metadata: Metadata = buildMetadata({
	title: "Community Guidelines",
	description: "The rules that keep Glimpse a good place to be.",
});

export default function Layout({ children }: { children: React.ReactNode }) {
	return children;
}
