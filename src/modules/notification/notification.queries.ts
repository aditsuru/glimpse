import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { orpc } from "@/lib/client/orpc-client";

export function useGetNotifications() {
	return useInfiniteQuery(
		orpc.notification.getAll.infiniteOptions({
			input: (pageParam) => ({ cursor: pageParam ?? null }),
			getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
			initialPageParam: undefined as Date | undefined,
		})
	);
}

/**
 * Side effects:
 * - Invalidate: notification.getUnreadCount
 */
export function useMarkNotificationSeen() {
	const queryClient = useQueryClient();
	return useMutation({
		...orpc.notification.markSeen.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: orpc.notification.getUnreadCount.key(),
			});
		},
	});
}

/**
 * Polled or refetched on focus for bell icon badge.
 */
export function useGetUnreadNotificationCount() {
	return useQuery({
		...orpc.notification.getUnreadCount.queryOptions({ input: {} }),
		refetchInterval: 30_000,
		staleTime: 10_000,
	});
}
