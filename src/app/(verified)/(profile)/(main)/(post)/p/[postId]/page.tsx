import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { orpc } from "@/lib/client/orpc-client";
import { getRequiredSession } from "@/lib/server/auth-utils";
import { PostPage } from "./PostPage";

export default async function Page({
	params,
}: {
	params: Promise<{ postId: string }>;
}) {
	const { postId } = await params;
	const { user } = await getRequiredSession();

	const queryClient = new QueryClient();
	await queryClient.prefetchQuery(
		orpc.post.get.queryOptions({ input: { postId } })
	);
	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<PostPage postId={postId} viewerUserId={user.id} />
		</HydrationBoundary>
	);
}
