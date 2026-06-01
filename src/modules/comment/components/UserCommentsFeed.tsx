"use client";

import { EmptyStateMessage } from "@/components/layout/EmptyStateMessage";
import { Loader } from "@/components/misc/Loader";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { CommentCard } from "@/modules/comment/components/CommentCard";
import { useGetAllCommentsByUser } from "../comment.queries";

interface UserCommentsFeedProps {
	username: string;
}

export const UserCommentsFeed = ({ username }: UserCommentsFeedProps) => {
	const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
		useGetAllCommentsByUser(username);

	const ref = useInfiniteScroll(fetchNextPage, isFetchingNextPage);
	const comments = data?.pages.flatMap((comment) => comment.items) ?? [];

	return (
		<div className="w-full h-full">
			{comments.map((comment) => (
				<div key={comment.id} className="border-b border-accent">
					<CommentCard
						data={comment}
						redirect={comment.parentCommentId ?? comment.id}
						hideToolbar
					/>
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
				<EmptyStateMessage
					title="No posts yet"
					description="You haven't liked anything yet"
				/>
			)}
		</div>
	);
};
