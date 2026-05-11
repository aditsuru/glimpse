import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { orpc } from "@/lib/client/orpc-client";
import { useViewerStore } from "@/store/use-viewer-store";

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

/**
 * Side effects:
 * - Invalidate on settle: profile.get[userId], profile.get[username:currentUsername]
 */
export function useUpdateAvatar() {
	const queryClient = useQueryClient();
	const viewerData = useViewerStore.getState();

	return useMutation({
		...orpc.profile.updateAvatar.mutationOptions(),
		onSettled: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: orpc.profile.get.queryOptions({
						input: { userId: viewerData.userId },
					}).queryKey,
				}),
				queryClient.invalidateQueries({
					queryKey: orpc.profile.get.queryOptions({
						input: { username: viewerData.username },
					}).queryKey,
				}),
			]);
		},
	});
}

/**
 * Side effects:
 * - Invalidate on settle: profile.get[userId], profile.get[username:currentUsername]
 */
export function useUpdateBanner() {
	const viewerData = useViewerStore.getState();
	const queryClient = useQueryClient();
	return useMutation({
		...orpc.profile.updateBanner.mutationOptions(),
		onSettled: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: orpc.profile.get.queryOptions({
						input: { userId: viewerData.userId },
					}).queryKey,
				}),
				queryClient.invalidateQueries({
					queryKey: orpc.profile.get.queryOptions({
						input: { username: viewerData.username },
					}).queryKey,
				}),
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
			input: (pageParam) => ({ query, cursor: pageParam }),
			getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
			initialPageParam: undefined as Date | undefined,
			enabled: query.length > 0,
		})
	);
}

/**
 * Side effects:
 * - Invalidate on settle: profile.get[userId], profile.get[username:currentUsername]
 */
export function useUpdateProfile() {
	const viewerData = useViewerStore.getState();

	const queryClient = useQueryClient();
	return useMutation({
		...orpc.profile.update.mutationOptions(),
		onSuccess: (_data, variables) => {
			if (variables.username) {
				useViewerStore
					.getState()
					.setViewer(viewerData.userId, variables.username);
			}
		},
		onSettled: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: orpc.profile.get.queryOptions({
						input: { userId: viewerData.userId },
					}).queryKey,
				}),
				queryClient.invalidateQueries({
					queryKey: orpc.profile.get.queryOptions({
						input: { username: viewerData.username },
					}).queryKey,
				}),
			]);
		},
	});
}

/**
 * Side effects:
 * - Invalidate on settle: profile.get[userId], profile.get[username:viewer],
 *   profile.search (viewerStatus changes for accounts interacting with viewer)
 */
export function useUpdateVisibility() {
	const viewerData = useViewerStore.getState();

	const queryClient = useQueryClient();
	return useMutation({
		...orpc.profile.updateVisibility.mutationOptions(),
		onSettled: async () => {
			const refetches: Promise<unknown>[] = [
				queryClient.invalidateQueries({
					queryKey: orpc.profile.get.queryOptions({
						input: { userId: viewerData.userId },
					}).queryKey,
				}),
				queryClient.invalidateQueries({ queryKey: orpc.profile.search.key() }),
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
