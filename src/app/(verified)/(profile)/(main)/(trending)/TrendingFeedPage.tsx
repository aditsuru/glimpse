"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";
import { EmptyStateMessage } from "@/components/layout/EmptyStateMessage";
import { FeedHeader } from "@/components/layout/FeedHeader";
import { Loader } from "@/components/misc/Loader";
import { ScrollContainer } from "@/components/VideoPlayer";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { PostCard } from "@/modules/post/components/PostCard";
import { useGetTrendingFeed } from "@/modules/post/post.queries";

export const TrendingFeedPage = () => {
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isLoading,
		isFetchingNextPage,
		isFetching,
		refetch,
	} = useGetTrendingFeed();

	const scrollRef = useRef<HTMLDivElement>(null);
	const ref = useInfiniteScroll(fetchNextPage, isFetchingNextPage);
	const posts = data?.pages.flatMap((post) => post.items) ?? [];

	// True only during a background refresh — not initial load, not pagination
	const isRefreshing = isFetching && !isLoading && !isFetchingNextPage;

	const handleRefresh = () => {
		scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
		refetch();
	};

	return (
		<div className="flex flex-col w-full h-full relative">
			<ScrollContainer
				ref={scrollRef}
				scrollKey="trending-feed"
				className="flex-1 overflow-y-auto no-scrollbar w-full h-full"
			>
				<FeedHeader onActiveTabClick={handleRefresh} />

				<AnimatePresence initial={false}>
					{isRefreshing && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="overflow-hidden flex justify-center"
						>
							<div className="py-4 pt-6">
								<Loader />
							</div>
						</motion.div>
					)}
				</AnimatePresence>

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
					<EmptyStateMessage title="No posts yet" />
				)}
				{!hasNextPage && posts.length > 0 && !isLoading && (
					<div className="text-center py-12 text-muted-foreground text-base">
						You've reached the end
					</div>
				)}
			</ScrollContainer>
		</div>
	);
};
