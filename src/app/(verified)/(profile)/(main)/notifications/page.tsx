import type { Metadata } from "next";
import { buildMetadata } from "@/lib/shared/metadata";
import { NotificationsFeed } from "@/modules/notification/components/NotificationFeed";

export const metadata: Metadata = buildMetadata({
	title: "Notifications",
	noindex: true,
});

export default function Page() {
	return <NotificationsFeed />;
}
