"use client";

import { ORPCError } from "@orpc/client";
import { EmptyStateMessage } from "@/components/layout/EmptyStateMessage";
import { ErrorMessage } from "@/components/layout/ErrorMessage";
import { PageHeader } from "@/components/layout/PageHeader";
import { ScrollContainer } from "@/components/VideoPlayer";
import { MobileProfileHeader } from "@/modules/profile/components/MobileProfileHeader";
import { Profile, ProfileSkeleton } from "@/modules/profile/components/Profile";
import { ProfileNavbar } from "@/modules/profile/components/ProfileNavbar";
import { useProfile } from "@/modules/profile/profile.queries";

interface ProfileLayoutProps {
	username: string;
	viewerUserId: string;
	children: React.ReactNode;
}

export const ProfileLayout = ({
	username,
	viewerUserId,
	children,
}: ProfileLayoutProps) => {
	const { data, isLoading, error } = useProfile({ username });

	if (error) {
		if (error instanceof ORPCError && error.code === "NOT_FOUND") {
			return (
				<EmptyStateMessage
					title="This account doesn't exist"
					description="Try searching for another"
				/>
			);
		}
		return <ErrorMessage />;
	}

	if (isLoading || !data) return <ProfileSkeleton />;

	return (
		<ScrollContainer className="flex flex-col w-full h-full overflow-y-auto no-scrollbar">
			<PageHeader title={username} className="max-sm:hidden" />
			<MobileProfileHeader
				title={username}
				className="sm:hidden"
				showMenu={data.userId === viewerUserId}
			/>
			<div className="flex-1 flex flex-col">
				<Profile data={data} viewerUserId={viewerUserId} />
				<ProfileNavbar
					username={username}
					userId={data.userId}
					viewerUserId={viewerUserId}
				/>
				<div className="flex-1">{children}</div>
			</div>
		</ScrollContainer>
	);
};
