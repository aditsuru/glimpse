"use client";

import { EmptyStateMessage } from "@/components/layout/EmptyStateMessage";
import { ScrollContainer } from "@/components/VideoPlayer";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { FollowButton } from "@/modules/follow/components/FollowButton";
import { usePendingSent } from "@/modules/follow/follow.queries";
import { ProfileCard } from "@/modules/profile/components/ProfileCard";
import { useViewerStore } from "@/store/use-viewer-store";
import { RequestsHeader } from "../RequestsHeader";

export default function Page() {
	const { data, fetchNextPage, hasNextPage, isFetching } = usePendingSent();
	const viewerData = useViewerStore.getState();

	const ref = useInfiniteScroll(fetchNextPage, isFetching);
	const profiles = data?.pages.flatMap((page) => page.items) ?? [];

	return (
		<main className="w-full h-full">
			<ScrollContainer className="overflow-y-auto no-scrollbar flex flex-col w-full h-full">
				<RequestsHeader />
				<div className="flex-1">
					{profiles.map((profile) => (
						<div
							key={profile.id}
							className="hover:bg-accent/20 px-4 flex items-center"
						>
							<ProfileCard data={profile} />

							{profile.userId !== viewerData.userId && (
								<FollowButton
									initialStatus={"pending"}
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
						<EmptyStateMessage title="There are no pending follow requests" />
					)}
				</div>
			</ScrollContainer>
		</main>
	);
}
