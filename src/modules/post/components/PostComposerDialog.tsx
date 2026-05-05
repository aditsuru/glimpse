"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { usePostComposerStore } from "@/store/use-post-composer-store";
import PostComposer from "./PostComposer";

export default function PostComposerDialog() {
	const { isOpen, close } = usePostComposerStore();

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
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
}
