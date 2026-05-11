"use client";

import { useSearchParams } from "next/navigation";
import { EmptyStateMessage } from "@/components/layout/EmptyStateMessage";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useGetPostComments } from "../comment.queries";
import { CommentCard } from "./CommentCard";

interface PostCommentsProps {
	postId: string;
}

export const PostComments = ({ postId }: PostCommentsProps) => {
	const searchParams = useSearchParams();
	const highlight = searchParams.get("highlight");

	const { data, fetchNextPage, hasNextPage, isFetching } = useGetPostComments(
		postId,
		highlight ? highlight : undefined
	);
	const ref = useInfiniteScroll(fetchNextPage, isFetching);
	const comments = data?.pages.flatMap((comment) => comment.items) ?? [];

	return (
		<div>
			{comments.map((comment) => (
				<div key={comment.id} className="border-b border-accent">
					<CommentCard data={comment} />
				</div>
			))}
			{hasNextPage && <div ref={ref} className="h-1" />}
			{comments.length === 0 && !isFetching && (
				<div className="flex-1 mt-20 md:mt-10 mb-4">
					<EmptyStateMessage
						title="No comments yet"
						description="Start the conversation"
					/>
				</div>
			)}
		</div>
	);
};
