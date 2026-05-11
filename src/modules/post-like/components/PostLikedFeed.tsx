"use client";

import { EmptyStateMessage } from "@/components/layout/EmptyStateMessage";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { authClient } from "@/lib/client/auth-client";
import { PostCard } from "@/modules/post/components/PostCard";
import { useGetLikedPosts } from "../post-like.queries";

export const PostLikedFeed = () => {
	const { data: sessionData } = authClient.useSession();
	const { data, fetchNextPage, hasNextPage, isFetching } = useGetLikedPosts();

	const ref = useInfiniteScroll(fetchNextPage, isFetching);
	const posts = data?.pages.flatMap((post) => post.items) ?? [];

	return (
		<div className="w-full h-full">
			{posts.map((post) => (
				<div key={post.id} className="border-b border-accent">
					<PostCard data={post} viewerUserId={sessionData?.user.id || ""} />
				</div>
			))}
			{hasNextPage && <div ref={ref} className="h-1" />}
			{posts.length === 0 && !isFetching && (
				<EmptyStateMessage
					title="No posts yet"
					description="You haven't liked anything yet"
				/>
			)}
		</div>
	);
};
