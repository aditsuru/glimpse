/** biome-ignore-all lint/suspicious/noExplicitAny: any is required */
"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/client/utils";
import type { ViewerFollowStatus } from "@/lib/server/helpers";
import {
	useFollowStatus,
	useRemoveFollow,
	useSendFollow,
} from "@/modules/follow/follow.queries";
import { useConfirmDialogStore } from "@/store/use-confirm-dialog-store";

interface FollowButtonProps {
	className?: string;
	targetUserId: string;
	targetUsername: string;
	initialStatus?: ViewerFollowStatus;
	targetVisibility: "public" | "private";
	showSkeleton?: boolean;
}

export const FollowButton = ({
	className,
	targetUserId,
	targetUsername,
	initialStatus,
	targetVisibility,
	showSkeleton = true,
}: FollowButtonProps) => {
	const openConfirmDialog = useConfirmDialogStore((state) => state.openDialog);

	const { data, isLoading } = useFollowStatus({ targetUserId }, initialStatus);

	const status = data?.status ?? "none";

	const sendFollow = useSendFollow({
		targetUsername,
		targetVisibility,
	});
	const removeFollow = useRemoveFollow({ targetUsername });

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
				openConfirmDialog({
					title: `Unfollow @${targetUsername}?`,
					description:
						"You will stop seeing their posts in your feed. Since this is a private account, you’ll need to send a new request if you want to follow them again.",
					confirmText: "Unfollow",
					confirmVariant: "destructive",
					className: "w-lg",
					onConfirm: () => removeFollow.mutate({ targetUserId }),
				});
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

	if (!showSkeleton && isInitialLoading) return null;

	if (isInitialLoading && showSkeleton) {
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
