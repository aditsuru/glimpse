import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { orpc } from "@/lib/client/orpc-client";

/**
 * Side effects:
 * - Optimistic: postLike.get[postId]
 * - Invalidate on settle: postLike.get[postId], postLike.getLikedPosts
 */
export function useAddPostLike() {
	const queryClient = useQueryClient();
	return useMutation({
		...orpc.postLike.add.mutationOptions(),
		onMutate: async ({ postId }) => {
			const getPostIdKey = orpc.postLike.get.queryOptions({
				input: { postId },
			}).queryKey;

			await queryClient.cancelQueries({ queryKey: getPostIdKey });

			const previousData = queryClient.getQueryData(getPostIdKey);

			const nextData = {
				count: (previousData?.count ?? 0) + 1,
				isLikedByUser: true,
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
					queryKey: orpc.postLike.get.queryOptions({
						input: { postId },
					}).queryKey,
				}),
				queryClient.invalidateQueries({
					queryKey: orpc.postLike.getLikedPosts.key(),
				}),
			]);
		},
	});
}

/**
 * Side effects:
 * - Optimistic: postLike.get[postId]
 * - Invalidate on settle: postLike.get[postId], postLike.getLikedPosts
 */
export function useRemovePostLike() {
	const queryClient = useQueryClient();
	return useMutation({
		...orpc.postLike.remove.mutationOptions(),
		onMutate: async ({ postId }) => {
			const getPostIdKey = orpc.postLike.get.queryOptions({
				input: { postId },
			}).queryKey;

			await queryClient.cancelQueries({ queryKey: getPostIdKey });

			const previousData = queryClient.getQueryData(getPostIdKey);

			const nextData = {
				count: Math.max((previousData?.count ?? 0) - 1, 0),
				isLikedByUser: false,
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
					queryKey: orpc.postLike.get.queryOptions({
						input: { postId },
					}).queryKey,
				}),
				queryClient.invalidateQueries({
					queryKey: orpc.postLike.getLikedPosts.key(),
				}),
			]);
		},
	});
}

export function useGetLikedPosts() {
	return useInfiniteQuery(
		orpc.postLike.getLikedPosts.infiniteOptions({
			input: (pageParam) => ({ cursor: pageParam }),
			getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
			initialPageParam: undefined as Date | undefined,
		})
	);
}

export function useGetPostLike(
	postId: string,
	initialData: {
		count: number;
		isLikedByUser: boolean;
	}
) {
	return useQuery({
		...orpc.postLike.get.queryOptions({
			input: { postId },
		}),
		staleTime: Infinity,
		initialData,
	});
}
