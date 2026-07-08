import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { orpc } from "@/lib/client/orpc-client";

export function useAdminReports(status: "pending" | "resolved" | "dismissed") {
	return useInfiniteQuery(
		orpc.adminReport.getReports.infiniteOptions({
			input: (pageParam) => ({ status, cursor: pageParam ?? null }),
			getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
			initialPageParam: undefined as Date | undefined,
		})
	);
}

export function useResolveReport() {
	const queryClient = useQueryClient();
	return useMutation({
		...orpc.adminReport.resolveReport.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: orpc.adminReport.getReports.key(),
			});
		},
	});
}

export function useAdminDmcaRequests(
	status: "pending" | "resolved" | "dismissed"
) {
	return useInfiniteQuery(
		orpc.adminReport.getDmcaRequests.infiniteOptions({
			input: (pageParam) => ({ status, cursor: pageParam ?? null }),
			getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
			initialPageParam: undefined as Date | undefined,
		})
	);
}

export function useResolveDmcaRequest() {
	const queryClient = useQueryClient();
	return useMutation({
		...orpc.adminReport.resolveDmcaRequest.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: orpc.adminReport.getDmcaRequests.key(),
			});
		},
	});
}
