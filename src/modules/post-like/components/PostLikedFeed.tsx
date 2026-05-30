"use client";

import { EmptyStateMessage } from "@/components/layout/EmptyStateMessage";
import { Loader } from "@/components/misc/Loader";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { PostCard } from "@/modules/post/components/PostCard";
import { useGetLikedPosts } from "../post-like.queries";

export const PostLikedFeed = () => {
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetching,
		isLoading,
		isFetchingNextPage,
	} = useGetLikedPosts();

	const ref = useInfiniteScroll(fetchNextPage, isFetching);
	const posts = data?.pages.flatMap((post) => post.items) ?? [];

	return (
		<div className="w-full h-full">
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
					title="No posts yet"
					description="You haven't liked anything yet"
				/>
			)}
		</div>
	);
};
