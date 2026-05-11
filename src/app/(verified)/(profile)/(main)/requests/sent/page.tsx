"use client";

import EmptyStateMessage from "@/components/layout/EmptyStateMessage";
import { ScrollContainer } from "@/components/VideoPlayer";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { authClient } from "@/lib/client/auth-client";
import FollowButton from "@/modules/follow/components/FollowButton";
import { usePendingSent } from "@/modules/follow/follow.queries";
import ProfileCard from "@/modules/profile/components/ProfileCard";
import RequestsHeader from "../RequestsHeader";

const Page = () => {
	const { data, fetchNextPage, hasNextPage, isFetching } = usePendingSent();
	const { data: sessionData } = authClient.useSession();

	const ref = useInfiniteScroll(fetchNextPage, isFetching);
	const profiles = data?.pages.flatMap((page) => page.items) ?? [];

	return (
		<main className="w-full h-full">
			<ScrollContainer className="overflow-y-auto no-scrollbar flex flex-col">
				<RequestsHeader />
				<div className="flex-1">
					{profiles.map((profile) => (
						<div
							key={profile.id}
							className="hover:bg-accent/20 px-4 flex items-center"
						>
							<ProfileCard data={profile} />

							{profile.userId !== sessionData?.user.id && (
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
};

export default Page;
