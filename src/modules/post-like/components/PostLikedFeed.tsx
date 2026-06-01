"use client";

import { EmptyStateMessage } from "@/components/layout/EmptyStateMessage";
import { Loader } from "@/components/misc/Loader";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { PostCard } from "@/modules/post/components/PostCard";
import { useGetLikedPosts } from "../post-like.queries";

export const PostLikedFeed = () => {
	const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
		useGetLikedPosts();

	const ref = useInfiniteScroll(fetchNextPage, isFetchingNextPage);
	const posts = data?.pages.flatMap((post) => post.items) ?? [];

	return (
		<div className="w-full h-full">
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
					description="You haven't liked anything yet"
				/>
			)}
		</div>
	);
};
