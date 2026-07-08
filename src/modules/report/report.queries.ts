import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/lib/client/orpc-client";

export function useCreateReport() {
	return useMutation(orpc.report.create.mutationOptions());
}
