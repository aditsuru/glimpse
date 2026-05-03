import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { orpc } from "@/lib/client/orpc-client";

export function useOnboard() {
	return useMutation(orpc.profile.onboard.mutationOptions());
}

export function useGetAvatarPresignedUrl() {
	return useMutation(orpc.profile.getAvatarPresignedUrl.mutationOptions());
}

export function useGetBannerPresignedUrl() {
	return useMutation(orpc.profile.getBannerPresignedUrl.mutationOptions());
}

export function useIsUsernameAvailable() {
	return useMutation(orpc.profile.isUsernameAvailable.mutationOptions());
}

export function useUpdateAvatar() {
	return useMutation(orpc.profile.updateAvatar.mutationOptions());
}

export function useUpdateBanner() {
	return useMutation(orpc.profile.updateBanner.mutationOptions());
}

/**
 * Side effects:
 * - Refetch: profile.get by userId and username
 */
export function useUpdateProfile({
	userId,
	username,
}: {
	userId: string;
	username: string;
}) {
	const queryClient = useQueryClient();
	return useMutation({
		...orpc.profile.update.mutationOptions(),
		onSettled: async () => {
			await Promise.all([
				queryClient.refetchQueries(
					orpc.profile.get.queryOptions({ input: { userId } })
				),
				queryClient.refetchQueries(
					orpc.profile.get.queryOptions({ input: { username } })
				),
			]);
		},
	});
}

export function useProfile(input: { username?: string; userId?: string }) {
	return useQuery(
		orpc.profile.get.queryOptions({
			input,
			enabled: !!(input.username || input.userId),
		})
	);
}

export function useSearchProfiles(query: string) {
	return useInfiniteQuery(
		orpc.profile.search.infiniteOptions({
			input: (pageParam) => ({ query, cursor: pageParam as Date | undefined }),
			getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
			initialPageParam: undefined as Date | undefined,
			enabled: query.length > 0,
		})
	);
}

/**
 * Side effects:
 * - Refetch on settle: profile.get (visibility, viewerStatus changes)
 * - Refetch on settle: profile.search (viewerStatus changes for private accounts)
 */
export function useUpdateVisibility() {
	const queryClient = useQueryClient();
	return useMutation({
		...orpc.profile.updateVisibility.mutationOptions(),
		onSettled: async () => {
			await Promise.all([
				queryClient.refetchQueries({ queryKey: orpc.profile.get.key() }),
				queryClient.refetchQueries({ queryKey: orpc.profile.search.key() }),
			]);
		},
	});
}
