import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/lib/client/orpc-client";

export function useSendBroadcast() {
	return useMutation(orpc.broadcast.send.mutationOptions());
}
