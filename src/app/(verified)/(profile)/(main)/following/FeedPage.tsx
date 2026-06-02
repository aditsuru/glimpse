"use client";

import { EmptyStateMessage } from "@/components/layout/EmptyStateMessage";
import { FeedHeader } from "@/components/layout/FeedHeader";
import { Loader } from "@/components/misc/Loader";
import { ScrollContainer } from "@/components/VideoPlayer";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { PostCard } from "@/modules/post/components/PostCard";
import { useGetFeed } from "@/modules/post/post.queries";

export const FeedPage = () => {
	const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
		useGetFeed();

	const ref = useInfiniteScroll(fetchNextPage, isFetchingNextPage);
	const posts = data?.pages.flatMap((post) => post.items) ?? [];

	return (
		<div className="flex flex-col w-full h-full relative">
			<ScrollContainer
				scrollKey="following-feed"
				className="flex-1 overflow-y-auto no-scrollbar w-full h-full"
			>
				<FeedHeader />
				{posts.map((post) => (
					<div
						key={post.id}
						className="border-b border-accent hover:bg-accent/15"
					>
						<PostCard data={post} />
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
				{posts.length === 0 && !isLoading && (
					<EmptyStateMessage
						title="No posts yet"
						description={`Start following people to have their latest posts on your feed`}
					/>
				)}
				{!hasNextPage && posts.length > 0 && !isLoading && (
					<div className="text-center py-12 text-muted-foreground text-base">
						You're all caught up
					</div>
				)}
			</ScrollContainer>
		</div>
	);
};
