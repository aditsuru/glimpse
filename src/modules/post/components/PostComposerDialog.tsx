"use client";

import { useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useMediaStore } from "@/store/use-media-store";
import { usePostComposerStore } from "@/store/use-post-composer-store";
import { PostComposer } from "./PostComposer";

export const PostComposerDialog = () => {
	const { isOpen, close, isLocked } = usePostComposerStore();

	useEffect(() => {
		useMediaStore.getState().setPausedGlobally(isOpen);
		if (isOpen) useMediaStore.getState().setActiveVideoId(null);
	}, [isOpen]);

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open && !isLocked) close();
			}}
		>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="text-xl font-semibold">
						Create Post
					</DialogTitle>
				</DialogHeader>
				<PostComposer onSuccess={close} />
			</DialogContent>
		</Dialog>
	);
};
