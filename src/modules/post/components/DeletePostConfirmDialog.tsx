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
import { useDeletePostConfirmStore } from "@/store/use-delete-post-confirm-store";

export const DeletePostConfirmDialog = () => {
	const dialogState = useDeletePostConfirmStore((state) => state.dialog);
	const closeDialog = useDeletePostConfirmStore((state) => state.closeDialog);

	const handleConfirm = () => {
		dialogState.onConfirm();
		closeDialog();
	};

	return (
		<Dialog open={dialogState.isOpen} onOpenChange={closeDialog}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-xl">Delete Post?</DialogTitle>
					<DialogDescription className="text-base text-muted-foreground">
						This can’t be undone and it will be removed from your profile, the
						timeline of any accounts that follow you, and from the trending
						feed.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="mt-4">
					<Button variant="outline" onClick={closeDialog}>
						Cancel
					</Button>
					<Button variant="destructive" onClick={handleConfirm}>
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
