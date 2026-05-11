"use client";

import { EmptyStateMessage } from "@/components/layout/EmptyStateMessage";
import { ScrollContainer } from "@/components/VideoPlayer";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { PostCard } from "@/modules/post/components/PostCard";
import { useGetFeed } from "@/modules/post/post.queries";
import { FeedHeader } from "./FeedHeader";

export const FeedPage = () => {
	const { data, fetchNextPage, hasNextPage, isFetching } = useGetFeed();

	const ref = useInfiniteScroll(fetchNextPage, isFetching);
	const posts = data?.pages.flatMap((post) => post.items) ?? [];

	return (
		<div className="flex flex-col w-full h-full relative">
			<FeedHeader />
			<ScrollContainer className="flex-1 overflow-y-auto no-scrollbar w-full h-full">
				{posts.map((post) => (
					<div key={post.id} className="border-b border-accent">
						<PostCard data={post} />
					</div>
				))}
				{hasNextPage && <div ref={ref} className="h-1" />}
				{posts.length === 0 && !isFetching && (
					<EmptyStateMessage
						title="No posts yet"
						description={`Start following people to have their latest posts on your feed`}
					/>
				)}
				{!hasNextPage && posts.length > 0 && !isFetching && (
					<div className="text-center py-8 text-muted-foreground text-base">
						You're all caught up
					</div>
				)}
			</ScrollContainer>
		</div>
	);
};
