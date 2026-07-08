import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/client/orpc-client";

export function useBanUser() {
	const queryClient = useQueryClient();
	return useMutation({
		...orpc.ban.create.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.report.key() });
			queryClient.invalidateQueries({ queryKey: orpc.dmca.key() });
		},
	});
}
