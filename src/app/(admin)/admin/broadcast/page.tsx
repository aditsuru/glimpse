import type { Metadata } from "next";
import { buildMetadata } from "@/lib/shared/metadata";
import { BroadcastPanel } from "@/modules/broadcast/components/BroadcastPanel";

export const metadata: Metadata = buildMetadata({
	title: "Admin · Broadcast",
	noindex: true,
});

export default function AdminBroadcastPage() {
	return <BroadcastPanel />;
}
