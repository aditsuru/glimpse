import { getRequiredSession } from "@/lib/server/auth-utils";
import { getServerCaller } from "@/lib/server/orpc-server";
import ProfileSidebar from "@/modules/profile/components/ProfileSidebar";

export default async function AuthGuard({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const orpc = await getServerCaller();
	const session = await getRequiredSession();
	const {
		username,
		displayName,
		avatarUrl,
		bannerUrl,
		bannerMimeType,
		bio,
		isGlimpseVerified,
		pronouns,
	} = await orpc.profile.get({ userId: session.user.id });

	return (
		<div className="w-screen h-dvh overflow-hidden grid grid-cols-6">
			{/* Profile Sidebar */}
			<section className="col-span-2 border-accent border-r-2 h-full">
				<ProfileSidebar
					displayName={displayName}
					username={username}
					avatarUrl={avatarUrl ?? undefined}
					isGlimpseVerified={isGlimpseVerified}
					pronouns={"he/she"}
					bio="Lorem ipsum dolor sit amet consectetur adipisicing elit."
				/>
			</section>

			{/* Main Content */}
			<section className="col-span-2 border-accent border-r-2 overflow-hidden h-full">
				{children}
			</section>

			{/* Secondary Sidebar */}
			<section className="col-span-2"></section>
		</div>
	);
}
