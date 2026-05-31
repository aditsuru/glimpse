"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/client/helpers";
import { cn } from "@/lib/client/utils";
import {
	useAddCommentLike,
	useGetCommentLike,
	useRemoveCommentLike,
} from "../comment-like.queries";

interface CommentLikeButtonProps {
	commentId: string;
	initialCount: number;
	initialState: boolean;
}

export const CommentLikeButton = ({
	initialCount,
	initialState,
	commentId,
}: CommentLikeButtonProps) => {
	const { data } = useGetCommentLike(commentId, {
		count: initialCount,
		isLikedByUser: initialState,
	});
	const addCommentLike = useAddCommentLike();
	const removeCommentLike = useRemoveCommentLike();

	const isLikedByUser = data?.isLikedByUser ?? initialCount;
	const count = data?.count ?? initialCount;
	const formattedCount = count === 0 ? "" : formatNumber.format(count);

	return (
		<Button
			variant="ghost"
			className="flex gap-1 text-muted-foreground/80 text-xs items-center rounded-2xl hover:bg-transparent! hover:text-[#f91e7f] p-0!"
			title="Like"
			onClick={() => {
				if (isLikedByUser) removeCommentLike.mutate({ commentId });
				else addCommentLike.mutate({ commentId });
			}}
		>
			<Heart
				className={cn(
					"size-4.5 transition-transform active:scale-125",
					isLikedByUser && "fill-[#f91e7f] scale-110"
				)}
				stroke={isLikedByUser ? "none" : "currentColor"}
			/>
			<span className="tabular-nums min-w-4 text-left">{formattedCount}</span>
		</Button>
	);
};
