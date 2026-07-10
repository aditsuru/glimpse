import type { Metadata } from "next";
import { buildMetadata } from "@/lib/shared/metadata";
import { FeedPage } from "./FeedPage";

export const metadata: Metadata = buildMetadata({
	title: "Following",
	noindex: true,
});

export default function Page() {
	return <FeedPage />;
}
