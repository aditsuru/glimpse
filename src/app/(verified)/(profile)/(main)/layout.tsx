import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import MobileNav from "@/components/layout/MobileNavbar";
import Navbar from "@/components/layout/Navbar";
import { orpc } from "@/lib/client/orpc-client";
import { getRequiredSession } from "@/lib/server/auth-utils";

export default async function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const { user } = await getRequiredSession();

	const queryClient = new QueryClient();
	await queryClient.prefetchQuery(
		orpc.profile.get.queryOptions({ input: { userId: user.id } })
	);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<div className="w-screen h-dvh overflow-hidden flex flex-col md:grid md:grid-cols-3 xl:grid-cols-6">
				{/* Sidebar - hidden on mobile */}
				<aside className="hidden md:flex border-accent border-r-2 h-full md:col-span-1 xl:col-span-2">
					<Navbar userId={user.id} />
				</aside>

				{/* Main Content */}
				<main className="flex-1 border-accent md:border-r-2 overflow-hidden h-full md:col-span-2 xl:col-span-2">
					{children}
				</main>

				{/* Secondary Sidebar */}
				<section className="hidden xl:block xl:col-span-2" />

				{/* Mobile Bottom Nav */}
				<MobileNav userId={user.id} />
			</div>
		</HydrationBoundary>
	);
}
