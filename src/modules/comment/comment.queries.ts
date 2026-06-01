import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { orpc } from "@/lib/client/orpc-client";
import { useViewerStore } from "@/store/use-viewer-store";

// Key helpers
const getAllCommentsByUserKey = (username: string) =>
	orpc.comment.getAllCommentsByUser.infiniteOptions({
		input: (pageParam) => ({ username, cursor: pageParam }),
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		initialPageParam: undefined as Date | undefined,
	}).queryKey;

const getCommentRepliesKey = (commentId: string) =>
	orpc.comment.getCommentReplies.infiniteOptions({
		input: (pageParam) => ({ commentId, cursor: pageParam }),
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		initialPageParam: undefined as Date | undefined,
	}).queryKey;

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

export function useGetAllCommentsByUser(username: string) {
	return useInfiniteQuery(
		orpc.comment.getAllCommentsByUser.infiniteOptions({
			input: (pageParam) => ({
				username,
				cursor: pageParam,
			}),
			getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
			initialPageParam: undefined as Date | undefined,
		})
	);
}

/**
 * Side effects:
 * - Invalidate on settle: comment.getCount[postId], comment.getPostComments[postId], comment.getAllCommentsByUser[username]
 */
export function useCreateComment(postId: string) {
	const queryClient = useQueryClient();
	const { username } = useViewerStore();

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
				queryClient.invalidateQueries({
					queryKey: getAllCommentsByUserKey(username),
				}),
			]);
		},
	});
}

/**
 * Side effects:
 * - Invalidate on settle: comment.getCommentReplies[commentId], comment.getCount[postId], comment.getPostComments (for repliesCount), comment.getAllCommentsByUser[username]
 */
export function useCreateReply({
	postId,
	commentId,
}: {
	postId: string;
	commentId: string;
}) {
	const queryClient = useQueryClient();
	const { username } = useViewerStore();

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
					queryKey: getCommentRepliesKey(commentId),
				}),
				queryClient.invalidateQueries({
					queryKey: orpc.comment.getPostComments.key(),
				}),
				queryClient.invalidateQueries({
					queryKey: getAllCommentsByUserKey(username),
				}),
			]);
		},
	});
}

/**
 * Side effects:
 * - Invalidate on settle: comment.getCount[postId], comment.getPostComments[postId], comment.getAllCommentsByUser[username]
 */
export function useDeleteComment({ postId }: { postId: string }) {
	const queryClient = useQueryClient();
	const { username } = useViewerStore();

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
				queryClient.invalidateQueries({
					queryKey: getAllCommentsByUserKey(username),
				}),
			]);
		},
	});
}
