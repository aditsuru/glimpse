/** biome-ignore-all lint/suspicious/noExplicitAny: any is required */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/client/utils";
import type { ViewerFollowStatus } from "@/lib/server/helpers";
import {
	useRemoveFollow,
	useSendFollow,
} from "@/modules/follow/follow.queries";

interface FollowButtonProps {
	className?: string;
	targetUserId: string;
	targetUsername: string;
	initialStatus: ViewerFollowStatus;
	targetVisibility: "public" | "private";
}

const FollowButton = ({
	className,
	targetUserId,
	targetUsername,
	initialStatus,
	targetVisibility,
}: FollowButtonProps) => {
	const [status, setStatus] = useState<ViewerFollowStatus>(initialStatus);
	const [dialogOpen, setDialogOpen] = useState(false);

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
			if (targetVisibility === "private") {
				setDialogOpen(true);
			} else {
				const previousStatus = status;
				setStatus(status === "mutual" ? "follows_you" : "none");
				try {
					await removeFollow.mutateAsync({ targetUserId });
				} catch {
					setStatus(previousStatus);
				}
			}
		}
	};

	const handleDialog = async () => {
		const previousStatus = status;
		setDialogOpen(false);
		setStatus(status === "mutual" ? "follows_you" : "none");
		try {
			await removeFollow.mutateAsync({ targetUserId });
		} catch {
			setStatus(previousStatus);
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
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-lg">Are you sure?</DialogTitle>
						<DialogDescription className="text-base">
							Unfollow @{targetUsername}? You will have to request to follow
							them again.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDialogOpen(false)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleDialog}>
							Unfollow
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default FollowButton;
