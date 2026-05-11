import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { orpc } from "@/lib/client/orpc-client";

/**
 * Side effects:
 * - Invalidate on settle: post.GetAllByUser[username]
 */
export function useCreatePost({ username }: { username: string }) {
	const queryClient = useQueryClient();

	return useMutation({
		...orpc.post.create.mutationOptions(),
		onSettled: async (_data, _err) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: orpc.post.getAllByUser.queryOptions({
						input: { username },
					}).queryKey,
				}),
			]);
		},
	});
}

/**
 * Side effects:
 * - Invalidate on settle: post.GetAllByUser[username], post.get[postId]
 */
export function useDeletePost({ username }: { username: string }) {
	const queryClient = useQueryClient();

	return useMutation({
		...orpc.post.delete.mutationOptions(),
		onSettled: async (_data, _err) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: orpc.post.getAllByUser.queryOptions({
						input: { username },
					}).queryKey,
				}),
			]);
		},
	});
}

export function useGetAttachmentPresignedUrl() {
	return useMutation(orpc.post.getAttachmentPresignedUrl.mutationOptions());
}

export function useMarkPostSeen() {
	return useMutation(orpc.post.markPostSeen.mutationOptions());
}

export function usePost(postId: string) {
	return useQuery(
		orpc.post.get.queryOptions({
			input: { postId },
		})
	);
}

export function useGetAllByUser(username: string) {
	return useInfiniteQuery(
		orpc.post.getAllByUser.infiniteOptions({
			input: (pageParam) => ({
				username,
				cursor: pageParam,
			}),
			getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
			initialPageParam: undefined as Date | undefined,
		})
	);
}

export function useGetFeed() {
	return useInfiniteQuery(
		orpc.post.getFeed.infiniteOptions({
			input: (pageParam) => ({
				cursor: pageParam,
			}),
			getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
			initialPageParam: undefined as Date | undefined,
		})
	);
}
