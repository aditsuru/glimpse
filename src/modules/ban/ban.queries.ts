import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/lib/client/orpc-client";

export function useBanUser() {
	return useMutation(orpc.ban.create.mutationOptions());
}
