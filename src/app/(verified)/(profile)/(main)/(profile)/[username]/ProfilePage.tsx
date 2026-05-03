"use client";

import { ORPCError } from "@orpc/client";
import { Ghost } from "lucide-react";
import UserNotFound from "@/components/layout/ErrorMessage";
import PageHeader from "@/components/layout/PageHeader";
import MobileProfileHeader from "@/modules/profile/components/MobileProfileHeader";
import { Profile, ProfileSkeleton } from "@/modules/profile/components/Profile";
import { useProfile } from "@/modules/profile/profile.queries";

const ProfilePage = ({
	username,
	viewerId,
}: {
	username: string;
	viewerId: string;
}) => {
	const { data, isLoading, error } = useProfile({ username });

	if (isLoading || !data) return <ProfileSkeleton />;

	if (error) {
		if (error instanceof ORPCError && error.code === "NOT_FOUND") {
			return (
				<div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
					<Ghost className="size-12" />
					<p className="text-lg font-semibold text-foreground">
						This account doesn't exist
					</p>
					<p className="text-sm">Try searching for another.</p>
				</div>
			);
		}
		return <UserNotFound />;
	}

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
