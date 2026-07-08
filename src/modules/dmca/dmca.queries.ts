import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { orpc } from "@/lib/client/orpc-client";

export function useCreateDmcaRequest() {
	return useMutation(orpc.dmca.create.mutationOptions());
}

export function useGetDmcaRequests(
	status: "pending" | "resolved" | "dismissed"
) {
	return useInfiniteQuery(
		orpc.dmca.getAll.infiniteOptions({
			input: (pageParam) => ({ status, cursor: pageParam ?? null }),
			getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
			initialPageParam: undefined as Date | undefined,
		})
	);
}

export function useResolveDmcaRequest() {
	const queryClient = useQueryClient();
	return useMutation({
		...orpc.dmca.resolve.mutationOptions(),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: orpc.dmca.key() }),
	});
}
