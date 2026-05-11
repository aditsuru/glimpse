"use client";

import { EllipsisVertical } from "lucide-react";
import { EmptyStateMessage } from "@/components/layout/EmptyStateMessage";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { FollowButton } from "@/modules/follow/components/FollowButton";
import {
	useFollowers,
	useRemoveFollower,
} from "@/modules/follow/follow.queries";
import { ProfileCard } from "@/modules/profile/components/ProfileCard";
import { useProfile } from "@/modules/profile/profile.queries";
import { useViewerStore } from "@/store/use-viewer-store";

interface FollowersPageProps {
	username: string;
}

export const FollowersPage = ({ username }: FollowersPageProps) => {
	const viewerData = useViewerStore((state) => state);

	const { data: profileData } = useProfile({ username });
	const { data, fetchNextPage, hasNextPage, isFetching } = useFollowers(
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

						{profile.userId !== viewerData.userId && (
							<FollowButton
								initialStatus={profile.viewerStatus}
								targetUserId={profile.userId}
								targetUsername={profile.username}
								targetVisibility={profile.visibility}
								className="mr-4"
							/>
						)}
						{profileData?.userId === viewerData.userId &&
							profile.userId !== viewerData.userId && (
								<DropdownMenuSubmenu followerId={profile.userId} />
							)}
					</div>
				))}
				{hasNextPage && <div ref={ref} className="h-1" />}
				{profiles.length === 0 && !isFetching && (
					<EmptyStateMessage
						title="No followers found"
						description={`Be the first to follow ${username}`}
					/>
				)}
			</div>
		</div>
	);
};

interface DropdownMenuSubmenuProps {
	followerId: string;
}
const DropdownMenuSubmenu = ({ followerId }: DropdownMenuSubmenuProps) => {
	const viewerData = useViewerStore((state) => state);

	const removeFollower = useRemoveFollower({ viewerUserId: viewerData.userId });

	const handleRemoveFollower = () => {
		removeFollower.mutate({
			followerId,
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button variant="ghost" className="rounded-full">
						<EllipsisVertical />
					</Button>
				}
			/>
			<DropdownMenuContent className="w-auto">
				<DropdownMenuGroup>
					<DropdownMenuItem
						onClick={handleRemoveFollower}
						className="text-destructive hover:text-destructive!"
					>
						Remove Follower
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
