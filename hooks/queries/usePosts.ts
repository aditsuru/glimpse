// import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
// import { orpc } from "@/lib/clients/orpc-client";

// // The shape of your backend's feed cursor
// type FeedCursor =
// 	| { source: "db" | "redis"; cursor: Date | string | null }
// 	| undefined;

// export function useFeed() {
// 	return useInfiniteQuery({
// 		// 1. Spread oRPC options
// 		...orpc.feed.get.infiniteOptions({
// 			input: (pageParam: FeedCursor) =>
// 				pageParam ? { nextCursor: pageParam } : {},
// 		}),
// 		// 2. Supply missing TanStack fields
// 		initialPageParam: undefined as FeedCursor,
// 		getNextPageParam: (lastPage) =>
// 			// If cursor is null, we've reached the end
// 			lastPage.nextCursor?.cursor ? lastPage.nextCursor : undefined,
// 	});
// }

// export function usePost(postId: string) {
// 	return useQuery({
// 		...orpc.post.get.queryOptions({
// 			input: { postId },
// 		}),
// 		enabled: !!postId, // Don't fetch if no ID is passed
// 	});
// }
