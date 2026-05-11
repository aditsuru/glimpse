import { PageHeader } from "@/components/layout/PageHeader";
import { BookmarkFeed } from "@/modules/bookmark/components/BookmarkFeed";

export default function Page() {
	return (
		<main className="w-full h-full overflow-y-auto no-scrollbar flex flex-col">
			<PageHeader title="Bookmarks" />
			<div className="flex-1">
				<BookmarkFeed />
			</div>
		</main>
	);
}
