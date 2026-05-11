import { ORPCError } from "@orpc/client";
import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { orpc } from "@/lib/client/orpc-client";
import type { ViewerFollowStatus } from "@/lib/server/helpers";
import { useViewerStore } from "@/store/use-viewer-store";

/**
 * Side effects:
 * - Optimistic: follow.getStatus[targetUserId]
 * - Invalidate on settle (public target): profile.get[username:viewer], profile.get[username:target], follow.getFollowing, follow.getFollowers[targetUserId], profile.search, follow.getPendingSent, follow.getStatus[targetUserId], post.getAllByUser, post.getFeed
 */

export function useSendFollow({
	targetUsername,
	targetVisibility = "public",
}: {
	targetUsername: string;
	targetVisibility?: "public" | "private";
}) {
	const queryClient = useQueryClient();
	const viewerData = useViewerStore.getState();

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
			const wasAccepted = targetVisibility === "public";

			const refetches: Promise<unknown>[] = [
				queryClient.invalidateQueries({
					queryKey: orpc.follow.getStatus.queryOptions({
						input: { targetUserId },
					}).queryKey,
				}),
				queryClient.invalidateQueries({ queryKey: orpc.profile.search.key() }),
				queryClient.invalidateQueries({
					queryKey: orpc.post.getAllByUser.queryOptions({
						input: { username: targetUsername },
					}).queryKey,
				}),
				queryClient.invalidateQueries({ queryKey: orpc.post.getFeed.key() }),
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

				refetches.push(
					queryClient.invalidateQueries({
						queryKey: orpc.profile.get.queryOptions({
							input: { username: viewerData.username },
						}).queryKey,
					})
				);
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
 * - Invalidate on settle (was accepted/mutual): profile.get[username:viewer], profile.get[username:target], follow.getFollowing, follow.getFollowers, follow.getStatus[targetUserId], profile.search, follow.getPendingSent, post.getAllByUser, post.getFeed
 */

export function useRemoveFollow({
	targetUsername,
}: {
	targetUsername: string;
}) {
	const queryClient = useQueryClient();
	const viewerData = useViewerStore.getState();

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
		onError: (err, _vars, context) => {
			if (!context?.statusKey) return;

			if (err instanceof ORPCError && err.code === "NOT_FOUND") return;

			queryClient.setQueryData(context.statusKey, {
				status: context.previousStatus,
			});
		},
		onSettled: async (_data, _err, { targetUserId }, context) => {
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
				queryClient.invalidateQueries({
					queryKey: orpc.post.getAllByUser.queryOptions({
						input: { username: targetUsername },
					}).queryKey,
				}),
				queryClient.invalidateQueries({ queryKey: orpc.post.getFeed.key() }),
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

				refetches.push(
					queryClient.invalidateQueries({
						queryKey: orpc.profile.get.queryOptions({
							input: { username: viewerData.username },
						}).queryKey,
					})
				);
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
 * - Invalidate on settle: profile.get[username:viewer], follow.getFollowers, follow.getStatus[followerId], profile.search
 */
export function useRemoveFollower() {
	const queryClient = useQueryClient();
	const viewerData = useViewerStore.getState();

	return useMutation({
		...orpc.follow.removeFollower.mutationOptions(),
		onSettled: async (_data, _err, { followerId }) => {
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

			refetches.push(
				queryClient.invalidateQueries({
					queryKey: orpc.profile.get.queryOptions({
						input: { username: viewerData.username },
					}).queryKey,
				})
			);

			await Promise.all(refetches);
		},
	});
}

/**
 * Side effects:
 * - Invalidate on settle: profile.get[username:viewer], follow.getPendingReceived, follow.getFollowers, follow.getStatus[followerId], profile.search
 */
export function useAcceptRequest() {
	const queryClient = useQueryClient();
	const viewerData = useViewerStore.getState();

	return useMutation({
		...orpc.follow.accept.mutationOptions(),
		onSettled: async (_data, _err, { followerId }) => {
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

			refetches.push(
				queryClient.invalidateQueries({
					queryKey: orpc.profile.get.queryOptions({
						input: { username: viewerData.username },
					}).queryKey,
				})
			);

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
	initialStatus?: ViewerFollowStatus
) {
	return useQuery({
		...orpc.follow.getStatus.queryOptions({
			input,
		}),
		...(initialStatus !== undefined && {
			initialData: { status: initialStatus },
			staleTime: Infinity,
		}),
	});
}

export function useFollowers(userId: string) {
	return useInfiniteQuery(
		orpc.follow.getFollowers.infiniteOptions({
			input: (pageParam) => ({ userId, cursor: pageParam }),
			getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
			initialPageParam: undefined as Date | undefined,
			enabled: !!userId,
		})
	);
}

export function useFollowing(userId: string) {
	return useInfiniteQuery(
		orpc.follow.getFollowing.infiniteOptions({
			input: (pageParam) => ({ userId, cursor: pageParam }),
			getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
			initialPageParam: undefined as Date | undefined,
			enabled: !!userId,
		})
	);
}

export function usePendingReceived() {
	return useInfiniteQuery(
		orpc.follow.getPendingReceived.infiniteOptions({
			input: (pageParam) => ({ cursor: pageParam }),
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
			input: (pageParam) => ({ cursor: pageParam }),
			getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
			initialPageParam: undefined as Date | undefined,
		})
	);
}
