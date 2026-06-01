"use client";

import { EmptyStateMessage } from "@/components/layout/EmptyStateMessage";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loader } from "@/components/misc/Loader";
import { ScrollContainer } from "@/components/VideoPlayer";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { PostCard } from "@/modules/post/components/PostCard";
import { useGetBookmarkedPosts } from "../bookmark.queries";

export const BookmarkFeed = () => {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
		useGetBookmarkedPosts();

	const ref = useInfiniteScroll(fetchNextPage, isFetchingNextPage);
	const posts = data?.pages.flatMap((post) => post.items) ?? [];

	return (
		<div className="flex flex-col w-full h-full relative">
			<ScrollContainer className="flex-1 w-full h-full overflow-y-auto no-scrollbar">
				<PageHeader title="Bookmarks" />
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
						title="No posts"
						description="You haven't bookmarked anything yet"
					/>
				)}
			</ScrollContainer>
		</div>
	);
};
