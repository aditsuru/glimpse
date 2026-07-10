import type { Metadata } from "next";
import { buildMetadata } from "@/lib/shared/metadata";

export const metadata: Metadata = buildMetadata({
	title: "Sign In",
	description: "Sign in to your Glimpse account.",
});

export default function Layout({ children }: { children: React.ReactNode }) {
	return children;
}
