"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/client/helpers";
import { cn } from "@/lib/client/utils";
import {
	useAddPostLike,
	useGetPostLike,
	useRemovePostLike,
} from "../post-like.queries";

interface PostLikeButtonProps {
	postId: string;
	initialCount: number;
	initialState: boolean;
}

const PostLikeButton = ({
	initialCount,
	initialState,
	postId,
}: PostLikeButtonProps) => {
	const { data } = useGetPostLike(postId, initialState === undefined);
	const addPostLike = useAddPostLike();
	const removePostLike = useRemovePostLike();

	const isLikedByUser = data?.isLikedByUser ?? initialCount;
	const count = data?.count ?? initialCount;
	const formattedCount = count === 0 ? "" : formatNumber.format(count);

	return (
		<Button
			variant="ghost"
			className="flex gap-1 text-muted-foreground text-sm items-center rounded-2xl hover:bg-transparent! hover:text-pink-500"
			onClick={() => {
				if (isLikedByUser) removePostLike.mutate({ postId });
				else addPostLike.mutate({ postId });
			}}
		>
			<Heart
				className={cn(
					"size-4.5 transition-transform active:scale-125",
					isLikedByUser && "fill-pink-500 scale-110"
				)}
				stroke={isLikedByUser ? "none" : "currentColor"}
			/>
			<span className="tabular-nums min-w-8 text-left">{formattedCount}</span>
		</Button>
	);
};

export default PostLikeButton;
