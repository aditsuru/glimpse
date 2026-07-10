import type { Metadata } from "next";
import { buildMetadata } from "@/lib/shared/metadata";

export const metadata: Metadata = buildMetadata({
	title: "Terms of Service",
	description: "The terms that govern your use of Glimpse.",
});

export default function Layout({ children }: { children: React.ReactNode }) {
	return children;
}
