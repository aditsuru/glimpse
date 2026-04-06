import PageNotFound from "@/components/layout/PageNotFound";
import { config } from "@/lib/shared/config";

export default async function AuthGuard({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	if (!(config.NODE_ENV === "development")) return <PageNotFound />;

	return <>{children}</>;
}
