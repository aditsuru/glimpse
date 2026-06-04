"use client";

import { EmptyStateMessage } from "@/components/layout/EmptyStateMessage";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loader } from "@/components/misc/Loader";
import { ScrollContainer } from "@/components/VideoPlayer";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import {
	useGetNotifications,
	useMarkNotificationSeen,
} from "../notification.queries";
import { NotificationCard } from "./NotificationCard";

export const NotificationsFeed = () => {
	const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
		useGetNotifications();

	const { mutate: markSeen } = useMarkNotificationSeen();

	const ref = useInfiniteScroll(fetchNextPage, isFetchingNextPage);
	const notifications = data?.pages.flatMap((page) => page.items) ?? [];

	return (
		<div className="flex flex-col w-full h-full relative">
			<ScrollContainer
				scrollKey="notifications-feed"
				className="flex-1 flex flex-col overflow-y-auto no-scrollbar w-full h-full"
			>
				<PageHeader title="Notifications" />
				{notifications.map((notification) => (
					<NotificationCard
						key={notification.id}
						data={notification}
						onVisible={() => {
							if (!notification.read) {
								markSeen({ notificationId: notification.id });
							}
						}}
					/>
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
				{notifications.length === 0 && !isLoading && (
					<EmptyStateMessage
						title="No notifications"
						description="You're all caught up"
					/>
				)}
				{!hasNextPage && notifications.length > 0 && !isLoading && (
					<div className="text-center py-12 text-muted-foreground text-base">
						You're all caught up
					</div>
				)}
			</ScrollContainer>
		</div>
	);
};
