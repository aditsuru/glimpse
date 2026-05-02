import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import PageHeader from "@/components/layout/PageHeader";
import { orpc } from "@/lib/client/orpc-client";
import { getRequiredSession } from "@/lib/server/auth-utils";
import ProfilePage from "./ProfilePage";

const Page = async ({ params }: { params: Promise<{ username: string }> }) => {
	const { username } = await params;
	const { user } = await getRequiredSession();

	const queryClient = new QueryClient();
	await queryClient.prefetchQuery(
		orpc.profile.get.queryOptions({ input: { username } })
	);
	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<PageHeader title={username} />
			<ProfilePage username={username} viewerId={user.id} />
		</HydrationBoundary>
	);
};

export default Page;
