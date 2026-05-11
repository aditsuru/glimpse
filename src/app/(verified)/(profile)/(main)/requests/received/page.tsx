"use client";

import { EmptyStateMessage } from "@/components/layout/EmptyStateMessage";
import { Button } from "@/components/ui/button";
import { ScrollContainer } from "@/components/VideoPlayer";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { authClient } from "@/lib/client/auth-client";
import {
	useAcceptRequest,
	usePendingReceived,
	useRejectRequest,
} from "@/modules/follow/follow.queries";
import { ProfileCard } from "@/modules/profile/components/ProfileCard";
import { RequestsHeader } from "../RequestsHeader";

export default function Page() {
	const { data, fetchNextPage, hasNextPage, isFetching } = usePendingReceived();
	const { data: sessionData } = authClient.useSession();
	const rejectRequest = useRejectRequest();
	const acceptRequest = useAcceptRequest({
		viewerUserId: sessionData?.user.id ?? "",
	});
	const disabledCondition = rejectRequest.isPending || acceptRequest.isPending;

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
					{hasNextPage && <div ref={ref} className="h-1" />}
					{profiles.length === 0 && !isFetching && (
						<EmptyStateMessage title="There are no pending follow requests" />
					)}
				</div>
			</ScrollContainer>
		</main>
	);
}
