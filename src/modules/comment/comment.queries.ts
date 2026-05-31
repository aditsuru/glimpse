import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { orpc } from "@/lib/client/orpc-client";

export function useGetCommentsCount(postId: string, initialCount: number) {
	return useQuery({
		...orpc.comment.getCount.queryOptions({
			input: { postId },
		}),
		staleTime: Infinity,
		initialData: { count: initialCount },
	});
}

export function useGetPostComments(
	postId: string,
	highlight: string | undefined
) {
	return useInfiniteQuery(
		orpc.comment.getPostComments.infiniteOptions({
			input: (pageParam) => ({
				postId,
				cursor: pageParam,
				highlight,
			}),
			getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
			initialPageParam: undefined as Date | undefined,
		})
	);
}

export function useGetCommentReplies(commentId: string, enabled: boolean) {
	return useInfiniteQuery({
		...orpc.comment.getCommentReplies.infiniteOptions({
			input: (pageParam) => ({
				commentId,
				cursor: pageParam,
			}),
			getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
			initialPageParam: undefined as Date | undefined,
		}),
		enabled,
	});
}

/**
 * Side effects:
 * - Invalidate on settle: comment.getCount[postId], comment.getPostComments[postId]
 */
export function useCreateComment(postId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		...orpc.comment.create.mutationOptions(),
		onSettled: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: orpc.comment.getCount.queryOptions({
						input: { postId },
					}).queryKey,
				}),
				queryClient.invalidateQueries({
					queryKey: orpc.comment.getPostComments.key(),
				}),
			]);
		},
	});
}

/**
 * Side effects:
 * - Invalidate on settle: comment.getCommentReplies[commentId], comment.getCount[postId], comment.getPostComments (for repliesCount)
 */
export function useCreateReply({
	postId,
	commentId,
}: {
	postId: string;
	commentId: string;
}) {
	const queryClient = useQueryClient();

	return useMutation({
		...orpc.comment.create.mutationOptions(),
		onSettled: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: orpc.comment.getCount.queryOptions({
						input: { postId },
					}).queryKey,
				}),
				queryClient.invalidateQueries({
					queryKey: orpc.comment.getCommentReplies.infiniteOptions({
						input: (pageParam) => ({ commentId, cursor: pageParam }),
						getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
						initialPageParam: undefined as Date | undefined,
					}).queryKey,
				}),
				queryClient.invalidateQueries({
					queryKey: orpc.comment.getPostComments.key(),
				}),
			]);
		},
	});
}

/**
 * Side effects:
 * - Invalidate on settle: comment.getCount[postId], comment.getPostComments[postId]
 */
export function useDeleteComment({ postId }: { postId: string }) {
	const queryClient = useQueryClient();

	return useMutation({
		...orpc.comment.delete.mutationOptions(),
		onSettled: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: orpc.comment.getCount.queryOptions({
						input: { postId },
					}).queryKey,
				}),
				queryClient.invalidateQueries({
					queryKey: orpc.comment.getPostComments.key(),
				}),
			]);
		},
	});
}
