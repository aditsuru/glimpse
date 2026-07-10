import type { Metadata } from "next";
import { buildMetadata } from "@/lib/shared/metadata";

export const metadata: Metadata = buildMetadata({
	title: "Privacy Policy",
	description: "How Glimpse collects, uses, and protects your data.",
});

export default function Layout({ children }: { children: React.ReactNode }) {
	return children;
}
