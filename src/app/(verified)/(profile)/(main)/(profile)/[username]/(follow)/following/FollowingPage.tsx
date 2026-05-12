"use client";

import { EmptyStateMessage } from "@/components/layout/EmptyStateMessage";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { FollowButton } from "@/modules/follow/components/FollowButton";
import { useFollowing } from "@/modules/follow/follow.queries";
import { ProfileCard } from "@/modules/profile/components/ProfileCard";
import { useProfile } from "@/modules/profile/profile.queries";
import { useViewerStore } from "@/store/use-viewer-store";

interface FollowingPageProps {
	username: string;
}

export const FollowingPage = ({ username }: FollowingPageProps) => {
	const { userId } = useViewerStore();

	const { data: profileData } = useProfile({ username });
	const { data, fetchNextPage, hasNextPage, isFetching } = useFollowing(
		profileData?.userId ?? ""
	);

	const ref = useInfiniteScroll(fetchNextPage, isFetching);
	const profiles = data?.pages.flatMap((page) => page.items) ?? [];

	return (
		<div className="w-full h-full">
			<div className="flex flex-col h-full">
				{profiles.map((profile) => (
					<div
						key={profile.id}
						className="hover:bg-accent/20 px-4 flex items-center"
					>
						<ProfileCard data={profile} />

						{profile.userId !== userId && (
							<FollowButton
								initialStatus={profile.viewerStatus}
								targetUserId={profile.userId}
								targetUsername={profile.username}
								targetVisibility={profile.visibility}
								className="mr-4"
							/>
						)}
					</div>
				))}
				{hasNextPage && <div ref={ref} className="h-1" />}
				{profiles.length === 0 && !isFetching && (
					<EmptyStateMessage title="This user doesn't follow any accounts" />
				)}
			</div>
		</div>
	);
};
