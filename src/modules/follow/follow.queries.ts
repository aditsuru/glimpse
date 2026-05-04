import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { orpc } from "@/lib/client/orpc-client";
import type { ViewerFollowStatus } from "@/lib/server/helpers";

/**
 * Side effects:
 * - Optimistic Updates: follow.getStatus
 * - Refetch on settle: profile.get, profile.search, follow.getFollowers, follow.getFollowing, follow.getStatus
 */

export function useSendFollow(targetVisibility?: "public" | "private") {
	const queryClient = useQueryClient();
	return useMutation({
		...orpc.follow.send.mutationOptions(),
		onMutate: async ({ targetUserId }) => {
			const statusKey = orpc.follow.getStatus.queryOptions({
				input: { targetUserId },
			}).queryKey;

			await queryClient.cancelQueries({ queryKey: statusKey });

			const previousStatus =
				queryClient.getQueryData<{ status: ViewerFollowStatus }>(statusKey)
					?.status ?? "none";

			// Hook computes optimistic status
			let nextStatus: ViewerFollowStatus = "pending";
			if (previousStatus === "follows_you") nextStatus = "mutual";
			else if (targetVisibility === "public") nextStatus = "accepted";

			queryClient.setQueryData(statusKey, { status: nextStatus });

			return { previousStatus, statusKey };
		},
		onError: (_err, _variables, context) => {
			// Rollback on error
			if (context?.statusKey) {
				queryClient.setQueryData(context.statusKey, {
					status: context.previousStatus,
				});
			}
		},
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
				queryClient.refetchQueries({
					queryKey: orpc.follow.getPendingReceived.key(),
				}),
				queryClient.refetchQueries({
					queryKey: orpc.follow.getPendingSent.key(),
				}),
				queryClient.refetchQueries({ queryKey: orpc.follow.getStatus.key() }),
			]);
		},
	});
}

export function useRemoveFollow() {
	const queryClient = useQueryClient();
	return useMutation({
		...orpc.follow.remove.mutationOptions(),
		onMutate: async ({ targetUserId }) => {
			const statusKey = orpc.follow.getStatus.queryOptions({
				input: { targetUserId },
			}).queryKey;

			await queryClient.cancelQueries({ queryKey: statusKey });

			const previousStatus =
				queryClient.getQueryData<{ status: ViewerFollowStatus }>(statusKey)
					?.status ?? "none";

			let nextStatus: ViewerFollowStatus = "none";
			if (previousStatus === "mutual") nextStatus = "follows_you";
			else if (previousStatus === "follows_you_pending")
				nextStatus = "follows_you";

			queryClient.setQueryData(statusKey, { status: nextStatus });

			return { previousStatus, statusKey };
		},
		onError: (_err, _variables, context) => {
			if (context?.statusKey) {
				queryClient.setQueryData(context.statusKey, {
					status: context.previousStatus,
				});
			}
		},
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
				queryClient.refetchQueries({
					queryKey: orpc.follow.getPendingReceived.key(),
				}),
				queryClient.refetchQueries({
					queryKey: orpc.follow.getPendingSent.key(),
				}),
				queryClient.refetchQueries({ queryKey: orpc.follow.getStatus.key() }),
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
				queryClient.refetchQueries({
					queryKey: orpc.follow.getPendingReceived.key(),
				}),
				queryClient.refetchQueries({
					queryKey: orpc.follow.getPendingSent.key(),
				}),
				queryClient.refetchQueries({
					queryKey: orpc.follow.getStatus.key(),
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
				queryClient.refetchQueries({
					queryKey: orpc.follow.getPendingReceived.key(),
				}),
				queryClient.refetchQueries({
					queryKey: orpc.follow.getStatus.key(),
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
				queryClient.refetchQueries({
					queryKey: orpc.follow.getPendingReceived.key(),
				}),
				queryClient.refetchQueries({
					queryKey: orpc.follow.getStatus.key(),
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
