/** biome-ignore-all lint/suspicious/noExplicitAny: any is required */
"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/client/utils";
import type { ViewerFollowStatus } from "@/lib/server/helpers";
import {
	useFollowStatus,
	useRemoveFollow,
	useSendFollow,
} from "@/modules/follow/follow.queries";
import { useDialogStore } from "@/store/use-unfollow-confirm-store";

interface FollowButtonProps {
	className?: string;
	targetUserId: string;
	targetUsername: string;
	initialStatus?: ViewerFollowStatus;
	targetVisibility: "public" | "private";
}

const FollowButton = ({
	className,
	targetUserId,
	targetUsername,
	initialStatus,
	targetVisibility,
}: FollowButtonProps) => {
	const openDialog = useDialogStore((state) => state.openUnfollowDialog);

	// Only fetch if we are NOT in a list (i.e. initialStatus is undefined)
	const { data, isLoading } = useFollowStatus(
		{ targetUserId },
		initialStatus === undefined
	);

	// The source of truth: Cache > List Prop > Fallback
	const status = data?.status ?? initialStatus ?? "none";

	// Hook takes targetVisibility so IT can do the optimistic math
	const sendFollow = useSendFollow(targetVisibility);
	const removeFollow = useRemoveFollow();

	const handleClick = () => {
		if (status === "none" || status === "follows_you") {
			sendFollow.mutate({ targetUserId });
		} else if (status === "pending" || status === "follows_you_pending") {
			removeFollow.mutate({ targetUserId });
		} else if (status === "accepted" || status === "mutual") {
			if (targetVisibility === "private") {
				// Pass the mutate function to the dialog to fire on confirm
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

	const { label, variant } = (() => {
		if (status === "none") return { label: "Follow", variant: "follow" };
		if (status === "follows_you")
			return { label: "Follow Back", variant: "follow" };
		if (status === "pending" || status === "follows_you_pending")
			return { label: "Requested", variant: "outline-ring" };
		if (status === "accepted" || status === "mutual")
			return { label: "Unfollow", variant: "outline-ring" };
		return { label: "Following", variant: "outline-ring" };
	})();

	return (
		<div>
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
		</div>
	);
};

export default FollowButton;
