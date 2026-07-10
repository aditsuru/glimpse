import type { Metadata } from "next";
import { buildMetadata } from "@/lib/shared/metadata";
import { BookmarkFeed } from "@/modules/bookmark/components/BookmarkFeed";

export const metadata: Metadata = buildMetadata({
	title: "Bookmarks",
	noindex: true,
});

export default function Page() {
	return (
		<main className="w-full h-full flex flex-col">
			<BookmarkFeed />
		</main>
	);
}
