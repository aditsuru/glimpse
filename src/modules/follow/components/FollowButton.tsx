/** biome-ignore-all lint/suspicious/noExplicitAny: any is required */
"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/client/auth-client";
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
	const { data: session } = authClient.useSession();
	const viewerUserId = session?.user.id ?? "";

	const { data, isLoading } = useFollowStatus(
		{ targetUserId },
		initialStatus === undefined
	);

	const status = data?.status ?? initialStatus ?? "none";

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
