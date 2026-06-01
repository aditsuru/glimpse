"use client";

import { useSearchParams } from "next/navigation";
import { EmptyStateMessage } from "@/components/layout/EmptyStateMessage";
import { Loader } from "@/components/misc/Loader";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useGetPostComments } from "../comment.queries";
import { CommentCard } from "./CommentCard";

interface PostCommentsProps {
	postId: string;
}

export const PostComments = ({ postId }: PostCommentsProps) => {
	const searchParams = useSearchParams();
	const highlight = searchParams.get("highlight");

	const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
		useGetPostComments(postId, highlight ? highlight : undefined);
	const ref = useInfiniteScroll(fetchNextPage, isFetchingNextPage);
	const comments = data?.pages.flatMap((comment) => comment.items) ?? [];

	return (
		<div>
			{comments.map((comment) => (
				<div key={comment.id} className="border-b border-accent pt-2">
					<CommentCard data={comment} />
				</div>
			))}
			{isLoading && (
				<div className="py-8 flex justify-center w-full">
					<Loader />
				</div>
			)}
			{hasNextPage && (
				<div ref={ref} className="py-12 flex justify-center w-full">
					<Loader />
				</div>
			)}
			{comments.length === 0 && !isLoading && (
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
