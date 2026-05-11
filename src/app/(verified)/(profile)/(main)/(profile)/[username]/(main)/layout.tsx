import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { orpc } from "@/lib/client/orpc-client";
import { getRequiredSession } from "@/lib/server/auth-utils";
import { ProfileProvider } from "./ProfileContext";
import { ProfileLayout } from "./ProfileLayout";

const Layout = async ({
	params,
	children,
}: {
	params: Promise<{ username: string }>;
	children: React.ReactNode;
}) => {
	const { username } = await params;
	const { user } = await getRequiredSession();

	const queryClient = new QueryClient();
	await queryClient.prefetchQuery(
		orpc.profile.get.queryOptions({ input: { username } })
	);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ProfileProvider username={username}>
				<ProfileLayout username={username} viewerUserId={user.id}>
					{children}
				</ProfileLayout>
			</ProfileProvider>
		</HydrationBoundary>
	);
};

export default Layout;
