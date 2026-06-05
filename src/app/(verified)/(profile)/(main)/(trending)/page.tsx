import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { TrendingFeedPage } from "@/app/(verified)/(profile)/(main)/(trending)/TrendingFeedPage";
import { orpc } from "@/lib/client/orpc-client";

export default async function Page() {
	const queryClient = new QueryClient();

	await queryClient.prefetchInfiniteQuery(
		orpc.post.getTrendingFeed.infiniteOptions({
			input: (pageParam) => ({
				cursor: pageParam ?? null,
			}),
			getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
			initialPageParam: undefined as { score: number; id: string } | undefined,
		})
	);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<TrendingFeedPage />
		</HydrationBoundary>
	);
}
