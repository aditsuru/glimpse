"use client";

import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/client/helpers";
import { cn } from "@/lib/client/utils";
import {
	useAddBookmark,
	useGetBookmark,
	useRemoveBookmark,
} from "../bookmark.queries";

interface BookmarkButtonProps {
	postId: string;
	initialCount: number;
	initialState: boolean;
}

const BookmarkButton = ({
	initialCount,
	initialState,
	postId,
}: BookmarkButtonProps) => {
	const { data } = useGetBookmark(postId, initialState === undefined);
	const addBookmark = useAddBookmark();
	const removeBookmark = useRemoveBookmark();

	const isBookmarkedByUser = data?.isBookmarkedByUser ?? initialCount;
	const count = data?.count ?? initialCount;
	const formattedCount = count === 0 ? "" : formatNumber.format(count);

	return (
		<Button
			variant="ghost"
			className="flex gap-1 text-muted-foreground text-sm items-center rounded-2xl hover:bg-transparent! hover:text-primary"
			onClick={() => {
				if (isBookmarkedByUser) removeBookmark.mutate({ postId });
				else addBookmark.mutate({ postId });
			}}
		>
			<Bookmark
				className={cn(
					"size-4.5 transition-transform active:scale-125",
					isBookmarkedByUser && "fill-primary scale-110"
				)}
				stroke={isBookmarkedByUser ? "none" : "currentColor"}
			/>
			<span className="tabular-nums min-w-8 text-left">{formattedCount}</span>
		</Button>
	);
};

export default BookmarkButton;
