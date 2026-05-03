/** biome-ignore-all lint/suspicious/noExplicitAny: any is required */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/client/utils";
import type { ViewerFollowStatus } from "@/lib/server/helpers";
import {
	useRemoveFollow,
	useSendFollow,
} from "@/modules/follow/follow.queries";

interface FollowButtonProps {
	className?: string;
	targetUserId: string;
	initialStatus: ViewerFollowStatus;
	targetVisibility: "public" | "private";
}

const FollowButton = ({
	className,
	targetUserId,
	initialStatus,
	targetVisibility,
}: FollowButtonProps) => {
	const [status, setStatus] = useState<ViewerFollowStatus>(initialStatus);

	useEffect(() => {
		setStatus(initialStatus);
	}, [initialStatus]);

	const sendFollow = useSendFollow();
	const removeFollow = useRemoveFollow();

	const handleClick = async () => {
		if (status === "none" || status === "follows_you") {
			const nextStatus =
				status === "follows_you"
					? "mutual"
					: targetVisibility === "private"
						? "pending"
						: "accepted";
			setStatus(nextStatus);
			await sendFollow.mutateAsync({ targetUserId });
		} else if (status === "pending" || status === "follows_you_pending") {
			setStatus(status === "follows_you_pending" ? "follows_you" : "none");
			await removeFollow.mutateAsync({ targetUserId });
		} else if (status === "accepted" || status === "mutual") {
			setStatus(status === "mutual" ? "follows_you" : "none");
			await removeFollow.mutateAsync({ targetUserId });
		}
	};

	const isPending = sendFollow.isPending || removeFollow.isPending;

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

export default FollowButton;
