"use client";

import { EmptyStateMessage } from "@/components/layout/EmptyStateMessage";
import { Loader } from "@/components/misc/Loader";
import { ScrollContainer } from "@/components/VideoPlayer";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { FollowButton } from "@/modules/follow/components/FollowButton";
import { usePendingSent } from "@/modules/follow/follow.queries";
import { ProfileCard } from "@/modules/profile/components/ProfileCard";
import { useViewerStore } from "@/store/use-viewer-store";
import { RequestsHeader } from "../RequestsHeader";

export default function Page() {
	const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
		usePendingSent();
	const { userId } = useViewerStore();

	const ref = useInfiniteScroll(fetchNextPage, isFetchingNextPage);
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

							{profile.userId !== userId && (
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
					{isLoading && (
						<div className="py-8 flex justify-center w-full">
							<Loader />
						</div>
					)}
					{hasNextPage && (
						<div ref={ref} className="py-12 flex justify-center w-full">
							<Loader />
						</div>
					)}
					{profiles.length === 0 && !isLoading && (
						<EmptyStateMessage title="There are no pending follow requests" />
					)}
				</div>
			</ScrollContainer>
		</main>
	);
}
