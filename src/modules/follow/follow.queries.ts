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
 * - Optimistic: follow.getStatus[targetUserId]
 * - Invalidate on settle (public target): profile.get[username:viewer], profile.get[username:target],
 *   follow.getFollowing, follow.getFollowers, follow.getStatus[targetUserId], profile.search
 * - Invalidate on settle (private target): follow.getPendingSent, follow.getStatus[targetUserId], profile.search
 */
export function useSendFollow({
	viewerUserId,
	targetUsername,
	targetVisibility = "public",
}: {
	viewerUserId: string;
	targetUsername: string;
	targetVisibility?: "public" | "private";
}) {
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

			let nextStatus: ViewerFollowStatus = "pending";
			if (previousStatus === "follows_you" && targetVisibility === "public") {
				nextStatus = "mutual";
			} else if (targetVisibility === "public") {
				nextStatus = "accepted";
			}

			queryClient.setQueryData(statusKey, { status: nextStatus });
			return { previousStatus, statusKey };
		},
		onError: (_err, _vars, context) => {
			if (context?.statusKey) {
				queryClient.setQueryData(context.statusKey, {
					status: context.previousStatus,
				});
			}
		},
		onSettled: async (_data, _err, { targetUserId }) => {
			const viewerUsername = queryClient.getQueryData<{ username?: string }>(
				orpc.profile.get.queryOptions({ input: { userId: viewerUserId } })
					.queryKey
			)?.username;

			const wasAccepted = targetVisibility === "public";

			const refetches: Promise<unknown>[] = [
				queryClient.invalidateQueries({
					queryKey: orpc.follow.getStatus.queryOptions({
						input: { targetUserId },
					}).queryKey,
				}),
				queryClient.invalidateQueries({ queryKey: orpc.profile.search.key() }),
			];

			if (wasAccepted) {
				refetches.push(
					queryClient.invalidateQueries({
						queryKey: orpc.profile.get.queryOptions({
							input: { username: targetUsername },
						}).queryKey,
					}),
					queryClient.invalidateQueries({
						queryKey: orpc.follow.getFollowing.key(),
					}),
					queryClient.invalidateQueries({
						queryKey: orpc.follow.getFollowers.key(),
					})
				);
				if (viewerUsername) {
					refetches.push(
						queryClient.invalidateQueries({
							queryKey: orpc.profile.get.queryOptions({
								input: { username: viewerUsername },
							}).queryKey,
						})
					);
				}
			} else {
				refetches.push(
					queryClient.invalidateQueries({
						queryKey: orpc.follow.getPendingSent.key(),
					})
				);
			}

			await Promise.all(refetches);
		},
	});
}

/**
 * Side effects:
 * - Optimistic: follow.getStatus[targetUserId]
 * - Invalidate on settle (was accepted/mutual): profile.get[username:viewer], profile.get[username:target],
 *   follow.getFollowing, follow.getFollowers, follow.getStatus[targetUserId], profile.search
 * - Invalidate on settle (was pending): follow.getPendingSent, follow.getStatus[targetUserId], profile.search
 */
export function useRemoveFollow({
	viewerUserId,
	targetUsername,
}: {
	viewerUserId: string;
	targetUsername: string;
}) {
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

			queryClient.setQueryData(statusKey, { status: nextStatus });
			return { previousStatus, statusKey };
		},
		onError: (_err, _vars, context) => {
			if (context?.statusKey) {
				queryClient.setQueryData(context.statusKey, {
					status: context.previousStatus,
				});
			}
		},
		onSettled: async (_data, _err, { targetUserId }, context) => {
			const viewerUsername = queryClient.getQueryData<{ username?: string }>(
				orpc.profile.get.queryOptions({ input: { userId: viewerUserId } })
					.queryKey
			)?.username;

			const previousStatus = context?.previousStatus ?? "none";
			const wasAccepted =
				previousStatus === "accepted" || previousStatus === "mutual";

			const refetches: Promise<unknown>[] = [
				queryClient.invalidateQueries({
					queryKey: orpc.follow.getStatus.queryOptions({
						input: { targetUserId },
					}).queryKey,
				}),
				queryClient.invalidateQueries({ queryKey: orpc.profile.search.key() }),
			];

			if (wasAccepted) {
				refetches.push(
					queryClient.invalidateQueries({
						queryKey: orpc.profile.get.queryOptions({
							input: { username: targetUsername },
						}).queryKey,
					}),
					queryClient.invalidateQueries({
						queryKey: orpc.follow.getFollowing.key(),
					}),
					queryClient.invalidateQueries({
						queryKey: orpc.follow.getFollowers.key(),
					})
				);
				if (viewerUsername) {
					refetches.push(
						queryClient.invalidateQueries({
							queryKey: orpc.profile.get.queryOptions({
								input: { username: viewerUsername },
							}).queryKey,
						})
					);
				}
			} else {
				refetches.push(
					queryClient.invalidateQueries({
						queryKey: orpc.follow.getPendingSent.key(),
					})
				);
			}

			await Promise.all(refetches);
		},
	});
}

/**
 * Side effects:
 * - Invalidate on settle: profile.get[username:viewer], follow.getFollowers,
 *   follow.getStatus[followerId], profile.search
 */
export function useRemoveFollower({ viewerUserId }: { viewerUserId: string }) {
	const queryClient = useQueryClient();

	return useMutation({
		...orpc.follow.removeFollower.mutationOptions(),
		onSettled: async (_data, _err, { followerId }) => {
			const viewerUsername = queryClient.getQueryData<{ username?: string }>(
				orpc.profile.get.queryOptions({ input: { userId: viewerUserId } })
					.queryKey
			)?.username;

			const refetches: Promise<unknown>[] = [
				queryClient.invalidateQueries({
					queryKey: orpc.follow.getStatus.queryOptions({
						input: { targetUserId: followerId },
					}).queryKey,
				}),
				queryClient.invalidateQueries({ queryKey: orpc.profile.search.key() }),
				queryClient.invalidateQueries({
					queryKey: orpc.follow.getFollowers.key(),
				}),
			];

			if (viewerUsername) {
				refetches.push(
					queryClient.invalidateQueries({
						queryKey: orpc.profile.get.queryOptions({
							input: { username: viewerUsername },
						}).queryKey,
					})
				);
			}

			await Promise.all(refetches);
		},
	});
}

/**
 * Side effects:
 * - Invalidate on settle: profile.get[username:viewer], follow.getPendingReceived,
 *   follow.getFollowers, follow.getStatus[followerId], profile.search
 */
export function useAcceptRequest({ viewerUserId }: { viewerUserId: string }) {
	const queryClient = useQueryClient();

	return useMutation({
		...orpc.follow.accept.mutationOptions(),
		onSettled: async (_data, _err, { followerId }) => {
			const viewerUsername = queryClient.getQueryData<{ username?: string }>(
				orpc.profile.get.queryOptions({ input: { userId: viewerUserId } })
					.queryKey
			)?.username;

			const refetches: Promise<unknown>[] = [
				queryClient.invalidateQueries({
					queryKey: orpc.follow.getStatus.queryOptions({
						input: { targetUserId: followerId },
					}).queryKey,
				}),
				queryClient.invalidateQueries({ queryKey: orpc.profile.search.key() }),
				queryClient.invalidateQueries({
					queryKey: orpc.follow.getPendingReceived.key(),
				}),
				queryClient.invalidateQueries({
					queryKey: orpc.follow.getPendingReceivedCount.key(),
				}),
				queryClient.invalidateQueries({
					queryKey: orpc.follow.getFollowers.key(),
				}),
			];

			if (viewerUsername) {
				refetches.push(
					queryClient.invalidateQueries({
						queryKey: orpc.profile.get.queryOptions({
							input: { username: viewerUsername },
						}).queryKey,
					})
				);
			}

			await Promise.all(refetches);
		},
	});
}

/**
 * Side effects:
 * - Invalidate on settle: follow.getPendingReceived, follow.getStatus[followerId], profile.search
 */
export function useRejectRequest() {
	const queryClient = useQueryClient();

	return useMutation({
		...orpc.follow.reject.mutationOptions(),
		onSettled: async (_data, _err, { followerId }) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: orpc.follow.getStatus.queryOptions({
						input: { targetUserId: followerId },
					}).queryKey,
				}),
				queryClient.invalidateQueries({
					queryKey: orpc.follow.getPendingReceived.key(),
				}),
				queryClient.invalidateQueries({
					queryKey: orpc.follow.getPendingReceivedCount.key(),
				}),
				queryClient.invalidateQueries({ queryKey: orpc.profile.search.key() }),
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

export function usePendingReceivedCount() {
	return useQuery(orpc.follow.getPendingReceivedCount.queryOptions());
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
