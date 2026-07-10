import type { Metadata } from "next";
import { buildMetadata } from "@/lib/shared/metadata";

export const metadata: Metadata = buildMetadata({
	title: "Sign Up",
	description: "Create a Glimpse account and start sharing.",
});

export default function Layout({ children }: { children: React.ReactNode }) {
	return children;
}
