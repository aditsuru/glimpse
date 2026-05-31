"use client";

import { EmptyStateMessage } from "@/components/layout/EmptyStateMessage";
import { Loader } from "@/components/misc/Loader";
import { Button } from "@/components/ui/button";
import { ScrollContainer } from "@/components/VideoPlayer";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import {
	useAcceptRequest,
	usePendingReceived,
	useRejectRequest,
} from "@/modules/follow/follow.queries";
import { ProfileCard } from "@/modules/profile/components/ProfileCard";
import { RequestsHeader } from "../RequestsHeader";

export default function Page() {
	const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
		usePendingReceived();

	const rejectRequest = useRejectRequest();
	const acceptRequest = useAcceptRequest();
	const disabledCondition = rejectRequest.isPending || acceptRequest.isPending;

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

							<div className="flex gap-4 mr-4">
								<Button
									variant="outline-ring"
									className="text-destructive"
									disabled={disabledCondition}
									onClick={() =>
										rejectRequest.mutate({ followerId: profile.userId })
									}
								>
									Reject
								</Button>
								<Button
									variant="outline-ring"
									disabled={disabledCondition}
									onClick={() =>
										acceptRequest.mutate({ followerId: profile.userId })
									}
								>
									Accept
								</Button>
							</div>
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
