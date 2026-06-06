import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { orpc } from "@/lib/client/orpc-client";
import { UserPostFeed } from "@/modules/post/components/UserPostFeed";
import { useProfile } from "@/modules/profile/profile.queries";
import { useProfileContext } from "./ProfileContext";

export default async function Page() {
	const { username } = useProfileContext();
	const { data } = useProfile({ username });

	const queryClient = new QueryClient();
	await queryClient.prefetchQuery(
		orpc.profile.get.queryOptions({
			input: { username },
		})
	);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<UserPostFeed username={username} userId={data?.userId ?? ""} />
		</HydrationBoundary>
	);
}
