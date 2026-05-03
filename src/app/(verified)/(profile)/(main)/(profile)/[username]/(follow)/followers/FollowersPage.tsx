"use client";

import Link from "next/link";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { authClient } from "@/lib/client/auth-client";
import FollowButton from "@/modules/follow/components/FollowButton";
import { useFollowers } from "@/modules/follow/follow.queries";
import ProfileCard from "@/modules/profile/components/ProfileCard";
import { useProfile } from "@/modules/profile/profile.queries";

const FollowersPage = ({ username }: { username: string }) => {
	const { data: sessionData } = authClient.useSession();
	const { data: profileData } = useProfile({ username });
	const { data, fetchNextPage, hasNextPage, isFetching } = useFollowers(
		profileData?.userId ?? ""
	);

	const ref = useInfiniteScroll(fetchNextPage, isFetching);
	const profiles = data?.pages.flatMap((page) => page.items) ?? [];

	return (
		<div className="w-full h-full overflow-y-auto no-scrollbar">
			<div className="flex flex-col">
				{profiles.map((profile) => (
					<div
						key={profile.id}
						className="hover:bg-accent/20 px-4 flex items-center"
					>
						<Link href={`/${profile.username}`} className="flex-1">
							<ProfileCard data={profile} />
						</Link>
						{profile.userId !== sessionData?.user.id && (
							<FollowButton
								initialStatus={profile.viewerStatus}
								targetUserId={profile.userId}
								targetVisibility={profile.visibility}
								className="mr-4"
							/>
						)}
					</div>
				))}
				{hasNextPage && <div ref={ref} className="h-1" />}
				{profiles.length === 0 && !isFetching && (
					<p className="text-center text-muted-foreground text-base py-8">
						No followers yet
					</p>
				)}
			</div>
		</div>
	);
};

export default FollowersPage;
