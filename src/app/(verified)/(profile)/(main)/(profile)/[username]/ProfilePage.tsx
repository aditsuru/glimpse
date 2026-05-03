"use client";

import { ORPCError } from "@orpc/client";
import UserNotFound from "@/components/layout/ErrorMessage";
import PageHeader from "@/components/layout/PageHeader";
import MobileProfileHeader from "@/modules/profile/components/MobileProfileHeader";
import {
	Profile,
	ProfileError,
	ProfileSkeleton,
} from "@/modules/profile/components/Profile";
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
			return <ProfileError />;
		}
		return <UserNotFound />;
	}

	if (isLoading || !data) return <ProfileSkeleton />;

	return (
		<div className="w-full h-full">
			<MobileProfileHeader
				title={username}
				className="sm:hidden"
				showMenu={data.userId === viewerId}
			/>
			<PageHeader title={username} className="max-sm:hidden" />
			<Profile data={data} viewerId={viewerId} />
		</div>
	);
};

export default ProfilePage;
