"use client";

import { EmptyStateMessage } from "@/components/layout/EmptyStateMessage";
import { ScrollContainer } from "@/components/VideoPlayer";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { authClient } from "@/lib/client/auth-client";
import { PostCard } from "@/modules/post/components/PostCard";
import { useGetBookmarkedPosts } from "../bookmark.queries";

export const BookmarkFeed = () => {
	const { data: sessionData } = authClient.useSession();
	const { data, fetchNextPage, hasNextPage, isFetching } =
		useGetBookmarkedPosts();

	const ref = useInfiniteScroll(fetchNextPage, isFetching);
	const posts = data?.pages.flatMap((post) => post.items) ?? [];

	return (
		<ScrollContainer className="w-full h-full">
			{posts.map((post) => (
				<div key={post.id} className="border-b border-accent">
					<PostCard data={post} viewerUserId={sessionData?.user.id || ""} />
				</div>
			))}
			{hasNextPage && <div ref={ref} className="h-1" />}
			{posts.length === 0 && !isFetching && (
				<EmptyStateMessage
					title="No posts"
					description="You haven't bookmarked anything yet"
				/>
			)}
		</ScrollContainer>
	);
};
