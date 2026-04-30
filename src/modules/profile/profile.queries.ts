import { useMutation } from "@tanstack/react-query";
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
