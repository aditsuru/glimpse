"use client";

import Link from "next/link";
import EmptyStateMessage from "@/components/layout/EmptyStateMessage";
import { Button } from "@/components/ui/button";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import {
	useAcceptRequest,
	usePendingReceived,
	useRejectRequest,
} from "@/modules/follow/follow.queries";
import ProfileCard from "@/modules/profile/components/ProfileCard";
import RequestsHeader from "../RequestsHeader";

const ReceivedPage = () => {
	const { data, fetchNextPage, hasNextPage, isFetching } = usePendingReceived();
	const rejectRequest = useRejectRequest();
	const acceptRequest = useAcceptRequest();

	const disabledCondition = rejectRequest.isPending || acceptRequest.isPending;

	const ref = useInfiniteScroll(fetchNextPage, isFetching);
	const profiles = data?.pages.flatMap((page) => page.items) ?? [];

	return (
		<main className="w-full h-full overflow-y-auto no-scrollbar flex flex-col">
			<RequestsHeader />
			<div className="flex-1">
				{profiles.map((profile) => (
					<div
						key={profile.id}
						className="hover:bg-accent/20 px-4 flex items-center"
					>
						<Link href={`/${profile.username}`} className="flex-1">
							<ProfileCard data={profile} />
						</Link>
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
		</main>
	);
};

export default ReceivedPage;
