import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/client/orpc-client";

export function useOnboard() {
	return useMutation(orpc.profile.onboard.mutationOptions());
}

export function useGetAvatarPresignedUrl() {
	return useMutation(orpc.profile.getAvatarPresignedUrl.mutationOptions());
}

export function useIsUsernameAvailable() {
	return useMutation(orpc.profile.isUsernameAvailable.mutationOptions());
}

export function useProfile(input: { username?: string; userId?: string }) {
	return useQuery(
		orpc.profile.get.queryOptions({
			input,
			enabled: !!(input.username || input.userId),
		})
	);
}
