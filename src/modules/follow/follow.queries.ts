import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { orpc } from "@/lib/client/orpc-client";

/**
 * Side effects:
 * - Optimistic: FollowButton maintains a local state. No cache operations.
 * - Refetch on settle: profile.get, profile.search, follow.getFollowers. follow.getFollowing
 */

export function useSendFollow() {
	const queryClient = useQueryClient();
	return useMutation({
		...orpc.follow.send.mutationOptions(),
		onSettled: async () => {
			await Promise.all([
				queryClient.refetchQueries({ queryKey: orpc.profile.get.key() }),
				queryClient.refetchQueries({ queryKey: orpc.profile.search.key() }),
				queryClient.refetchQueries({
					queryKey: orpc.follow.getFollowers.key(),
				}),
				queryClient.refetchQueries({
					queryKey: orpc.follow.getFollowing.key(),
				}),
			]);
		},
	});
}

export function useRemoveFollow() {
	const queryClient = useQueryClient();
	return useMutation({
		...orpc.follow.remove.mutationOptions(),
		onSettled: async () => {
			await Promise.all([
				queryClient.refetchQueries({ queryKey: orpc.profile.get.key() }),
				queryClient.refetchQueries({ queryKey: orpc.profile.search.key() }),
				queryClient.refetchQueries({
					queryKey: orpc.follow.getFollowers.key(),
				}),
				queryClient.refetchQueries({
					queryKey: orpc.follow.getFollowing.key(),
				}),
			]);
		},
	});
}

export function useRemoveFollower() {
	const queryClient = useQueryClient();
	return useMutation({
		...orpc.follow.removeFollower.mutationOptions(),
		onSettled: async () => {
			await Promise.all([
				queryClient.refetchQueries({ queryKey: orpc.profile.get.key() }),
				queryClient.refetchQueries({ queryKey: orpc.profile.search.key() }),
				queryClient.refetchQueries({
					queryKey: orpc.follow.getFollowers.key(),
				}),
				queryClient.refetchQueries({
					queryKey: orpc.follow.getFollowing.key(),
				}),
			]);
		},
	});
}

export function useAcceptRequest() {
	const queryClient = useQueryClient();
	return useMutation({
		...orpc.follow.accept.mutationOptions(),
		onSettled: async () => {
			await Promise.all([
				queryClient.refetchQueries({ queryKey: orpc.profile.get.key() }),
				queryClient.refetchQueries({ queryKey: orpc.profile.search.key() }),
				queryClient.refetchQueries({
					queryKey: orpc.follow.getFollowers.key(),
				}),
				queryClient.refetchQueries({
					queryKey: orpc.follow.getFollowing.key(),
				}),
			]);
		},
	});
}

export function useRejectRequest() {
	const queryClient = useQueryClient();
	return useMutation({
		...orpc.follow.reject.mutationOptions(),
		onSettled: async () => {
			await Promise.all([
				queryClient.refetchQueries({ queryKey: orpc.profile.get.key() }),
				queryClient.refetchQueries({ queryKey: orpc.profile.search.key() }),
				queryClient.refetchQueries({
					queryKey: orpc.follow.getFollowers.key(),
				}),
				queryClient.refetchQueries({
					queryKey: orpc.follow.getFollowing.key(),
				}),
			]);
		},
	});
}

export function useFollowStatus(
	input: { targetUserId: string },
	enabled = true
) {
	return useQuery(
		orpc.follow.getStatus.queryOptions({
			input,
			enabled,
		})
	);
}

export function useFollowers(userId: string) {
	return useInfiniteQuery(
		orpc.follow.getFollowers.infiniteOptions({
			input: (pageParam) => ({ userId, cursor: pageParam as Date | undefined }),
			getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
			initialPageParam: undefined as Date | undefined,
			enabled: !!userId,
		})
	);
}

export function useFollowing(userId: string) {
	return useInfiniteQuery(
		orpc.follow.getFollowing.infiniteOptions({
			input: (pageParam) => ({ userId, cursor: pageParam as Date | undefined }),
			getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
			initialPageParam: undefined as Date | undefined,
			enabled: !!userId,
		})
	);
}

export function usePendingReceived() {
	return useInfiniteQuery(
		orpc.follow.getPendingReceived.infiniteOptions({
			input: (pageParam) => ({ cursor: pageParam as Date | undefined }),
			getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
			initialPageParam: undefined as Date | undefined,
		})
	);
}

export function usePendingSent() {
	return useInfiniteQuery(
		orpc.follow.getPendingSent.infiniteOptions({
			input: (pageParam) => ({ cursor: pageParam as Date | undefined }),
			getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
			initialPageParam: undefined as Date | undefined,
		})
	);
}
