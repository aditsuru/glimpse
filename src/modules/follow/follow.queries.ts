import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/client/orpc-client";

export function useSendFollow() {
	return useMutation(orpc.follow.send.mutationOptions());
}

export function useRemoveFollow() {
	return useMutation(orpc.follow.remove.mutationOptions());
}

export function useRemoveFollower() {
	return useMutation(orpc.follow.removeFollower.mutationOptions());
}

export function useAcceptRequest() {
	return useMutation(orpc.follow.accept.mutationOptions());
}

export function useRejectRequest() {
	return useMutation(orpc.follow.reject.mutationOptions());
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
