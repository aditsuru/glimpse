"use client";

import {
	Bookmark,
	ChartNoAxesColumn,
	Heart,
	MessageCircle,
	Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatCount(n: number) {
	if (n < 1000) return n.toString();
	if (n < 1000000) return `${(n / 1000).toFixed(1)}k`;
	return `${(n / 1000000).toFixed(1)}m`;
}

interface PostActionsProps {
	likes: number;
	comments: number;
	bookmarks: number;
	views: number;
	hasUserLiked: boolean;
	hasUserBookmarked: boolean;
	onLike?: () => void;
	onComment?: () => void;
	onBookmark?: () => void;
	onShare?: () => void;
	className?: string;
}

export function PostActions({
	likes,
	comments,
	bookmarks,
	views,
	hasUserLiked,
	hasUserBookmarked,
	onLike,
	onComment,
	onBookmark,
	onShare,
	className,
}: PostActionsProps) {
	const wrapStop = (fn?: () => void) => (e: React.MouseEvent) => {
		e.stopPropagation();
		fn?.();
	};

	return (
		<div className={cn("flex items-center gap-1 justify-between", className)}>
			<Button
				variant="ghost"
				size="sm"
				onClick={wrapStop(onLike)}
				className="gap-1.5 text-muted-foreground hover:bg-transparent!"
			>
				<Heart
					size={16}
					className={hasUserLiked ? "fill-destructive text-destructive" : ""}
				/>
				<span className="text-xs">{formatCount(likes)}</span>
			</Button>

			<Button
				variant="ghost"
				size="sm"
				onClick={wrapStop(onComment)}
				className="gap-1.5 text-muted-foreground hover:bg-transparent!"
			>
				<MessageCircle size={16} />
				<span className="text-xs">{formatCount(comments)}</span>
			</Button>

			<Button
				variant="ghost"
				size="sm"
				onClick={wrapStop(onBookmark)}
				className="gap-1.5 text-muted-foreground hover:bg-transparent!"
			>
				<Bookmark
					size={16}
					className={hasUserBookmarked ? "fill-foreground text-foreground" : ""}
				/>
				<span className="text-xs">{formatCount(bookmarks)}</span>
			</Button>

			<Button variant="ghost" size="sm" className="gap-1.5" disabled>
				<ChartNoAxesColumn size={16} />
				<span className="text-xs">{formatCount(views)}</span>
			</Button>

			<Button
				variant="ghost"
				size="sm"
				onClick={wrapStop(onShare)}
				className="gap-1.5 text-muted-foreground hover:bg-transparent! px-2 py-1"
			>
				<Share2 size={16} />
			</Button>
		</div>
	);
}
