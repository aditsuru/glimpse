import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/client/orpc-client";

export function useGetSecuritySettings() {
	return useQuery(orpc.account.getSecuritySettings.queryOptions());
}

export function useSetPassword() {
	const queryClient = useQueryClient();
	return useMutation({
		...orpc.account.setPassword.mutationOptions(),
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey: orpc.account.getSecuritySettings.key(),
			});
		},
	});
}

export function useVerifyPassword() {
	return useMutation(orpc.account.verifyPassword.mutationOptions());
}
