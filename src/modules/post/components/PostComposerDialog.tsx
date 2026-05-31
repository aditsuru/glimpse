"use client";

import { useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useConfirmDialogStore } from "@/store/use-confirm-dialog-store";
import { useMediaStore } from "@/store/use-media-store";
import { usePostComposerStore } from "@/store/use-post-composer-store";
import { PostComposer } from "./PostComposer";

export const PostComposerDialog = () => {
	const { isOpen, close, isLocked, isDirty, composerKey, resetComposer } =
		usePostComposerStore();
	const openConfirmDialog = useConfirmDialogStore((state) => state.openDialog);

	useEffect(() => {
		useMediaStore.getState().setPausedGlobally(isOpen);
		if (isOpen) useMediaStore.getState().setActiveVideoId(null);
	}, [isOpen]);

	const handleOpenChange = (open: boolean) => {
		if (open || isLocked) return;

		if (isDirty) {
			openConfirmDialog({
				title: "Discard Draft?",
				description:
					"You have unsaved changes. Are you sure you want to discard them?",
				confirmText: "Discard",
				cancelText: "Keep Editing",
				confirmVariant: "destructive",
				onConfirm: () => {
					close();
					setTimeout(() => resetComposer(), 200);
				},
			});
		} else {
			close();
			setTimeout(() => resetComposer(), 200);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="text-xl font-semibold">
						Create Post
					</DialogTitle>
				</DialogHeader>
				<PostComposer key={composerKey} onSuccess={close} />
			</DialogContent>
		</Dialog>
	);
};
