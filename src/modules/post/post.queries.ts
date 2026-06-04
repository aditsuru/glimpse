import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { orpc } from "@/lib/client/orpc-client";
import { useViewerStore } from "@/store/use-viewer-store";

// Helper function
const getAllByUserKey = (username: string) =>
	orpc.post.getAllByUser.infiniteOptions({
		input: (pageParam) => ({ username, cursor: pageParam }),
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		initialPageParam: undefined as Date | undefined,
	}).queryKey;

/**
 * Side effects:
 * - Invalidate on settle: post.GetAllByUser[username]
 */
export function useCreatePost() {
	const queryClient = useQueryClient();
	const { username } = useViewerStore();

	return useMutation({
		...orpc.post.create.mutationOptions(),
		onSettled: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: getAllByUserKey(username),
				}),
				queryClient.invalidateQueries({
					queryKey: orpc.post.getFeed.key(),
				}),
			]);
		},
	});
}

/**
 * Side effects:
 * - Invalidate on settle: post.GetAllByUser[username], post.get[postId]
 */
export function useDeletePost() {
	const queryClient = useQueryClient();
	const { username } = useViewerStore();

	return useMutation({
		...orpc.post.delete.mutationOptions(),
		onSettled: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: getAllByUserKey(username),
				}),
				queryClient.invalidateQueries({
					queryKey: orpc.post.getFeed.key(),
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

export function useGetTrendingFeed() {
	return useInfiniteQuery(
		orpc.post.getTrendingFeed.infiniteOptions({
			input: (pageParam) => ({
				cursor: pageParam ?? null,
			}),
			getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
			initialPageParam: undefined as { score: number; id: string } | undefined,
		})
	);
}

export function useGetBillboard() {
	return useQuery({
		...orpc.post.getBillboard.queryOptions(),
		refetchInterval: 60000 * 15,
	});
}
