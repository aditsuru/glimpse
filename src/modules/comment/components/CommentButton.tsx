"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/client/helpers";
import { useGetCommentsCount } from "../comment.queries";

interface CommentButtonProps {
	postId: string;
	initialCount: number;
}

const CommentButton = ({ initialCount, postId }: CommentButtonProps) => {
	const { data } = useGetCommentsCount(postId, initialCount);

	const count = data.count;
	const formattedCount = count === 0 ? "" : formatNumber.format(count);

	return (
		<Link href={`/p/${postId}`}>
			<Button
				variant="ghost"
				className="flex gap-1 text-muted-foreground/80 text-xs items-center rounded-2xl hover:bg-transparent! hover:text-green-500"
				title="Comment"
			>
				<MessageCircle
					className={"size-4.5 transition-transform active:scale-125"}
				/>
				<span className="tabular-nums min-w-8 text-left">{formattedCount}</span>
			</Button>
		</Link>
	);
};

export default CommentButton;
