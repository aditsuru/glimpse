import type { Metadata } from "next";
import { buildMetadata } from "@/lib/shared/metadata";

export const metadata: Metadata = buildMetadata({
	title: "Reset Password",
	noindex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
	return children;
}
