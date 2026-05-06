"use client";

import EmptyStateMessage from "@/components/layout/EmptyStateMessage";
import { ScrollContainer } from "@/components/VideoPlayer";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { authClient } from "@/lib/client/auth-client";
import PostCard from "@/modules/post/components/PostCard";
import { useGetFeed } from "@/modules/post/post.queries";

const FeedPage = () => {
	const { data, fetchNextPage, hasNextPage, isFetching } = useGetFeed();

	const { data: sessionData } = authClient.useSession();

	const ref = useInfiniteScroll(fetchNextPage, isFetching);
	const posts = data?.pages.flatMap((post) => post.items) ?? [];

	return (
		<div className="flex flex-col w-full h-full">
			<div className="w-full h-18 border-b text-center pt-4 relative">
				<h2 className="text-lg font-semibold pt-3 relative">For You</h2>
				<span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-primary rounded-full" />
			</div>
			<ScrollContainer className="flex-1 overflow-y-auto no-scrollbar">
				{posts.map((post) => (
					<div key={post.id} className="border-b border-accent">
						<PostCard data={post} viewerUserId={sessionData?.user.id || ""} />
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

export default FeedPage;
