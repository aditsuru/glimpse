import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/client/orpc-client";

/**
 * Side effects:
 * - Optimistic: commentLike.get[commentId]
 * - Invalidate on settle: commentLike.get[commentId]
 */
export function useAddCommentLike() {
	const queryClient = useQueryClient();
	return useMutation({
		...orpc.commentLike.add.mutationOptions(),
		onMutate: async ({ commentId }) => {
			const getCommentIdKey = orpc.commentLike.get.queryOptions({
				input: { commentId },
			}).queryKey;

			await queryClient.cancelQueries({ queryKey: getCommentIdKey });

			const previousData = queryClient.getQueryData(getCommentIdKey);

			const nextData = {
				count: (previousData?.count ?? 0) + 1,
				isLikedByUser: true,
			};

			queryClient.setQueryData(getCommentIdKey, nextData);

			return { previousData, getCommentIdKey };
		},

		onError: (_err, _vars, context) => {
			if (!context?.getCommentIdKey) return;

			queryClient.setQueryData(context.getCommentIdKey, context?.previousData);
		},

		onSettled: async (_data, _err, { commentId }, _context) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: orpc.commentLike.get.queryOptions({
						input: { commentId },
					}).queryKey,
				}),
			]);
		},
	});
}

/**
 * Side effects:
 * - Optimistic: commentLike.get[commentId]
 * - Invalidate on settle: commentLike.get[commentId]
 */
export function useRemoveCommentLike() {
	const queryClient = useQueryClient();
	return useMutation({
		...orpc.commentLike.remove.mutationOptions(),
		onMutate: async ({ commentId }) => {
			const getCommentIdKey = orpc.commentLike.get.queryOptions({
				input: { commentId },
			}).queryKey;

			await queryClient.cancelQueries({ queryKey: getCommentIdKey });

			const previousData = queryClient.getQueryData(getCommentIdKey);

			const nextData = {
				count: Math.max((previousData?.count ?? 0) - 1, 0),
				isLikedByUser: false,
			};

			queryClient.setQueryData(getCommentIdKey, nextData);

			return { previousData, getCommentIdKey };
		},

		onError: (_err, _vars, context) => {
			if (!context?.getCommentIdKey) return;

			queryClient.setQueryData(context.getCommentIdKey, context?.previousData);
		},

		onSettled: async (_data, _err, { commentId }, _context) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: orpc.commentLike.get.queryOptions({
						input: { commentId },
					}).queryKey,
				}),
			]);
		},
	});
}

export function useGetCommentLike(
	commentId: string,
	initialData: {
		count: number;
		isLikedByUser: boolean;
	}
) {
	return useQuery({
		...orpc.commentLike.get.queryOptions({
			input: { commentId },
		}),
		staleTime: Infinity,
		initialData,
	});
}
