import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { orpc } from "@/lib/client/orpc-client";

export function useCreateReport() {
	return useMutation(orpc.report.create.mutationOptions());
}

export function useGetReports(status: "pending" | "resolved" | "dismissed") {
	return useInfiniteQuery(
		orpc.report.getAll.infiniteOptions({
			input: (pageParam) => ({ status, cursor: pageParam ?? null }),
			getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
			initialPageParam: undefined as Date | undefined,
		})
	);
}

export function useResolveReport() {
	const queryClient = useQueryClient();
	return useMutation({
		...orpc.report.resolve.mutationOptions(),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: orpc.report.key() }),
	});
}

export function useDeleteReportedContent() {
	const queryClient = useQueryClient();
	return useMutation({
		...orpc.report.deleteContent.mutationOptions(),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: orpc.report.key() }),
	});
}
