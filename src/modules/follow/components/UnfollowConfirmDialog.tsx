"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useUnfollowConfirmStore } from "@/store/use-unfollow-confirm-store";

export const UnfollowConfirmDialog = () => {
	const unfollowDialogState = useUnfollowConfirmStore(
		(state) => state.unfollowDialog
	);
	const closeDialog = useUnfollowConfirmStore(
		(state) => state.closeUnfollowDialog
	);

	const handleConfirm = () => {
		unfollowDialogState.onConfirm();
		closeDialog();
	};

	return (
		<Dialog open={unfollowDialogState.isOpen} onOpenChange={closeDialog}>
			<DialogContent className="w-lg">
				<DialogHeader>
					<DialogTitle className="text-lg">
						Unfollow @{unfollowDialogState.targetUsername}?
					</DialogTitle>
					<DialogDescription className="text-base">
						You will stop seeing their posts in your feed. Since this is a
						private account, you’ll need to send a new request if you want to
						follow them again.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={closeDialog}>
						Cancel
					</Button>
					<Button variant="destructive" onClick={handleConfirm}>
						Unfollow
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
