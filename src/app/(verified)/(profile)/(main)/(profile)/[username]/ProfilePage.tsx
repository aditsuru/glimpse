"use client";

import { ORPCError } from "@orpc/client";
import EmptyStateMessage from "@/components/layout/EmptyStateMessage";
import ErrorMessage from "@/components/layout/ErrorMessage";
import PageHeader from "@/components/layout/PageHeader";
import { ScrollContainer } from "@/components/VideoPlayer";
import UserPostFeed from "@/modules/post/components/UserPostFeed";
import MobileProfileHeader from "@/modules/profile/components/MobileProfileHeader";
import { Profile, ProfileSkeleton } from "@/modules/profile/components/Profile";
import ProfileNavbar from "@/modules/profile/components/ProfileNavbar";
import { useProfile } from "@/modules/profile/profile.queries";

const ProfilePage = ({
	username,
	viewerId,
}: {
	username: string;
	viewerId: string;
}) => {
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
				showMenu={data.userId === viewerId}
			/>
			<div className="flex-1 flex flex-col">
				<Profile data={data} viewerId={viewerId} />
				<ProfileNavbar
					username={username}
					userId={data.userId}
					viewerId={viewerId}
				/>
				<div className="flex-1">
					<UserPostFeed username={username} />
				</div>
			</div>
		</ScrollContainer>
	);
};

export default ProfilePage;
