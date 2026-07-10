import type { Metadata } from "next";
import { buildMetadata } from "@/lib/shared/metadata";
import { ReportsPanel } from "@/modules/admin-report/components/ReportsPanel";

export const metadata: Metadata = buildMetadata({
	title: "Admin · Reports",
	noindex: true,
});

export default function AdminReportsPage() {
	return <ReportsPanel />;
}
