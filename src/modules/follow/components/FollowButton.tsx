/** biome-ignore-all lint/suspicious/noExplicitAny: any is required */
"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/client/auth-client";
import { cn } from "@/lib/client/utils";
import type { ViewerFollowStatus } from "@/lib/server/helpers";
import {
	useFollowStatus,
	useRemoveFollow,
	useSendFollow,
} from "@/modules/follow/follow.queries";
import { useUnfollowConfirmStore } from "@/store/use-unfollow-confirm-store";

interface FollowButtonProps {
	className?: string;
	targetUserId: string;
	targetUsername: string;
	initialStatus?: ViewerFollowStatus;
	targetVisibility: "public" | "private";
}

export const FollowButton = ({
	className,
	targetUserId,
	targetUsername,
	initialStatus,
	targetVisibility,
}: FollowButtonProps) => {
	const openDialog = useUnfollowConfirmStore(
		(state) => state.openUnfollowDialog
	);
	const { data: session } = authClient.useSession();
	const viewerUserId = session?.user.id ?? "";

	const { data, isLoading } = useFollowStatus({ targetUserId }, initialStatus);

	const status = data?.status ?? "none";

	const sendFollow = useSendFollow({
		viewerUserId,
		targetUsername,
		targetVisibility,
	});
	const removeFollow = useRemoveFollow({ viewerUserId, targetUsername });

	const handleClick = () => {
		if (
			status === "none" ||
			status === "follows_you" ||
			status === "follows_you_pending"
		) {
			sendFollow.mutate({ targetUserId });
		} else if (status === "pending") {
			removeFollow.mutate({ targetUserId });
		} else if (status === "accepted" || status === "mutual") {
			if (targetVisibility === "private") {
				openDialog(targetUsername, () => removeFollow.mutate({ targetUserId }));
			} else {
				removeFollow.mutate({ targetUserId });
			}
		}
	};

	const isPending =
		sendFollow.isPending ||
		removeFollow.isPending ||
		(isLoading && initialStatus === undefined);

	const isInitialLoading = isLoading && initialStatus === undefined;

	const { label, variant } = (() => {
		if (status === "none") return { label: "Follow", variant: "follow" };
		if (status === "follows_you" || status === "follows_you_pending")
			return { label: "Follow Back", variant: "follow" };
		if (status === "pending")
			return { label: "Requested", variant: "outline-ring" };
		if (status === "accepted" || status === "mutual")
			return { label: "Unfollow", variant: "outline-ring" };
		return { label: "Follow", variant: "follow" };
	})();

	if (isInitialLoading) {
		return <Skeleton className="h-9 w-24 rounded-full" />;
	}

	return (
		<Button
			variant={variant as any}
			onClick={(e) => {
				e.stopPropagation();
				handleClick();
			}}
			disabled={isPending}
			className={cn(className)}
		>
			{label}
		</Button>
	);
};
