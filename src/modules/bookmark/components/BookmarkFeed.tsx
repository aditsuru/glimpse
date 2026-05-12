"use client";

import { EmptyStateMessage } from "@/components/layout/EmptyStateMessage";
import { Loader } from "@/components/misc/Loader";
import { ScrollContainer } from "@/components/VideoPlayer";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { PostCard } from "@/modules/post/components/PostCard";
import { useGetBookmarkedPosts } from "../bookmark.queries";

export const BookmarkFeed = () => {
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetching,
		isFetchingNextPage,
		isLoading,
	} = useGetBookmarkedPosts();

	const timeout = async () => {
		await new Promise((resolve) => setTimeout(resolve, 4000));
		fetchNextPage();
	};

	const ref = useInfiniteScroll(timeout, isFetching);
	const posts = data?.pages.flatMap((post) => post.items) ?? [];

	return (
		<ScrollContainer className="w-full h-full">
			{posts.map((post) => (
				<div key={post.id} className="border-b border-accent">
					<PostCard data={post} />
				</div>
			))}
			{hasNextPage && <div ref={ref} className="h-1" />}
			{(isLoading || isFetchingNextPage) && (
				<div className="py-8 flex justify-center w-full">
					<Loader />
				</div>
			)}
			{posts.length === 0 && !isFetching && (
				<EmptyStateMessage
					title="No posts"
					description="You haven't bookmarked anything yet"
				/>
			)}
		</ScrollContainer>
	);
};
