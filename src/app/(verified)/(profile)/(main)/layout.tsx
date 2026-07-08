import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { LayoutEffects } from "@/app/(verified)/(profile)/layoutEffects";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { MobileNavbar } from "@/components/layout/MobileNavbar";
import { Navbar } from "@/components/layout/Navbar";
import { SecondarySidebar } from "@/components/layout/SecondarySidebar";
import { ViewerInitializer } from "@/components/misc/ViewerInitializer";
import { orpc } from "@/lib/client/orpc-client";
import { getRequiredSession } from "@/lib/server/auth-utils";
import { getServerCaller } from "@/lib/server/orpc-server";
import { PostComposerDialog } from "@/modules/post/components/PostComposerDialog";
import { ReportDialog } from "@/modules/report/components/ReportDialog";

export default async function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const { user } = await getRequiredSession();
	const caller = await getServerCaller();
	const viewerProfile = await caller.profile.get({ userId: user.id });

	const queryClient = new QueryClient();
	queryClient.setQueryData(
		orpc.profile.get.queryOptions({ input: { userId: user.id } }).queryKey,
		viewerProfile
	);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ViewerInitializer
				userId={user.id}
				username={viewerProfile?.username ?? ""}
			/>

			<div className="w-screen h-dvh relative overflow-hidden flex flex-col md:grid md:grid-cols-3 xl:grid-cols-6">
				{/* Sidebar - hidden on mobile */}
				<aside className="hidden md:flex border-accent border-r h-full md:col-span-1 xl:col-span-2">
					<Navbar userId={user.id} />
				</aside>

				{/* Main Content */}
				<main className="flex-1 border-accent md:border-r overflow-hidden h-full md:col-span-2 xl:col-span-2 bg-background">
					{children}
				</main>

				{/* Secondary Sidebar */}
				<section className="hidden xl:block xl:col-span-2">
					<SecondarySidebar />
				</section>

				{/* Mobile Bottom Nav */}
				<MobileNavbar userId={user.id} />

				{/* Misc */}
				<LayoutEffects />

				{/* Dialogs */}
				<ConfirmDialog />
				<PostComposerDialog />
				<ReportDialog />
			</div>
		</HydrationBoundary>
	);
}
