"use client";

import { EmptyStateMessage } from "@/components/layout/EmptyStateMessage";
import { Loader } from "@/components/misc/Loader";
import { Separator } from "@/components/ui/separator";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { cn } from "@/lib/client/utils";
import { CommentCard } from "@/modules/comment/components/CommentCard";
import { PostCard } from "@/modules/post/components/PostCard";
import { useViewerStore } from "@/store/use-viewer-store";
import { useGetAllCommentsByUser } from "../comment.queries";

interface UserCommentsFeedProps {
	username: string;
}

export const UserCommentsFeed = ({ username }: UserCommentsFeedProps) => {
	const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
		useGetAllCommentsByUser(username);

	const { username: viewerUsername } = useViewerStore();
	const ref = useInfiniteScroll(fetchNextPage, isFetchingNextPage);
	const comments = data?.pages.flatMap((comment) => comment.items) ?? [];

	return (
		<div className="w-full h-full">
			{comments.map((comment) => {
				const isReply = "parentComment" in comment.context;

				return (
					<div
						key={comment.id}
						className="border-b border-accent pt-2 hover:bg-accent/15"
					>
						{"parentComment" in comment.context ? (
							<CommentCard
								data={comment.context.parentComment}
								redirect={comment.context.parentComment.id}
								hideNestedReplies
								forceConnector
								pfpSize="lg"
							/>
						) : (
							<div className="px-4">
								<PostCard data={comment.context.post} />
								<div className="pt-2 pb-6 px-4">
									<Separator />
								</div>
							</div>
						)}
						<div
							className={cn("-translate-y-2", {
								"ml-4": isReply,
								"px-4": !isReply,
							})}
						>
							<CommentCard
								data={comment}
								redirect={comment.parentCommentId ?? comment.id}
								hideToolbar
								isNested={"parentComment" in comment.context}
								hideConnectors
								pfpSize="lg"
							/>
						</div>
					</div>
				);
			})}
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
					title="No comments yet"
					description={
						username === viewerUsername
							? `You haven't commented on anything yet`
							: `${username} hasn't commented on anything yet`
					}
				/>
			)}
		</div>
	);
};
