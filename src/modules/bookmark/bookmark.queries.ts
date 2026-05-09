import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { orpc } from "@/lib/client/orpc-client";

/**
 * Side effects:
 * - Optimistic: bookmark.get[postId]
 * - Invalidate on settle: bookmark.get[postId], bookmark.getBookmarkedPosts
 */
export function useAddBookmark() {
	const queryClient = useQueryClient();
	return useMutation({
		...orpc.bookmark.add.mutationOptions(),
		onMutate: async ({ postId }) => {
			const getPostIdKey = orpc.bookmark.get.queryOptions({
				input: { postId },
			}).queryKey;

			await queryClient.cancelQueries({ queryKey: getPostIdKey });

			const previousData = queryClient.getQueryData(getPostIdKey);

			const nextData = {
				count: (previousData?.count ?? 0) + 1,
				isBookmarkedByUser: true,
			};

			queryClient.setQueryData(getPostIdKey, nextData);

			return { previousData, getPostIdKey };
		},

		onError: (_err, _vars, context) => {
			if (!context?.getPostIdKey) return;

			queryClient.setQueryData(context.getPostIdKey, context?.previousData);
		},

		onSettled: async (_data, _err, { postId }, _context) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: orpc.bookmark.get.queryOptions({
						input: { postId },
					}).queryKey,
				}),
				queryClient.invalidateQueries({
					queryKey: orpc.bookmark.getBookmarkedPosts.key(),
				}),
			]);
		},
	});
}

/**
 * Side effects:
 * - Optimistic: bookmark.get[postId]
 * - Invalidate on settle: bookmark.get[postId], bookmark.getBookmarkedPosts
 */
export function useRemoveBookmark() {
	const queryClient = useQueryClient();
	return useMutation({
		...orpc.bookmark.remove.mutationOptions(),
		onMutate: async ({ postId }) => {
			const getPostIdKey = orpc.bookmark.get.queryOptions({
				input: { postId },
			}).queryKey;

			await queryClient.cancelQueries({ queryKey: getPostIdKey });

			const previousData = queryClient.getQueryData(getPostIdKey);

			const nextData = {
				count: Math.max((previousData?.count ?? 0) - 1, 0),
				isBookmarkedByUser: false,
			};

			queryClient.setQueryData(getPostIdKey, nextData);

			return { previousData, getPostIdKey };
		},

		onError: (_err, _vars, context) => {
			if (!context?.getPostIdKey) return;

			queryClient.setQueryData(context.getPostIdKey, context?.previousData);
		},

		onSettled: async (_data, _err, { postId }, _context) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: orpc.bookmark.get.queryOptions({
						input: { postId },
					}).queryKey,
				}),
				queryClient.invalidateQueries({
					queryKey: orpc.bookmark.getBookmarkedPosts.key(),
				}),
			]);
		},
	});
}

export function useGetBookmarkedPosts() {
	return useInfiniteQuery(
		orpc.bookmark.getBookmarkedPosts.infiniteOptions({
			input: (pageParam) => ({ cursor: pageParam }),
			getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
			initialPageParam: undefined as Date | undefined,
		})
	);
}

export function useGetBookmark(postId: string, enabled: boolean) {
	return useQuery(
		orpc.bookmark.get.queryOptions({
			input: { postId },
			enabled,
		})
	);
}
