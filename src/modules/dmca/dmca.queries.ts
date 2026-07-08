import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/lib/client/orpc-client";

export function useCreateDmcaRequest() {
	return useMutation(orpc.dmca.create.mutationOptions());
}
