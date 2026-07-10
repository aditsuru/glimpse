import type { Metadata } from "next";
import { PageNotFound } from "@/components/layout/PageNotFound";
import { config } from "@/lib/shared/config";
import { buildMetadata } from "@/lib/shared/metadata";

export const metadata: Metadata = buildMetadata({
	title: "Dev Preview",
	noindex: true,
});

export default async function AuthGuard({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	if (!(config.NODE_ENV === "development")) return <PageNotFound />;

	return <>{children}</>;
}
