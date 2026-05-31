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
import { cn } from "@/lib/client/utils";
import { useConfirmDialogStore } from "@/store/use-confirm-dialog-store";

export const ConfirmDialog = () => {
	const { dialog, closeDialog } = useConfirmDialogStore();
	const {
		title,
		description,
		confirmText,
		cancelText,
		confirmVariant,
		className,
		onConfirm,
		onCancel,
	} = dialog.options;

	const handleConfirm = () => {
		onConfirm();
		closeDialog();
	};

	const handleCancel = () => {
		if (onCancel) onCancel();
		closeDialog();
	};

	return (
		<Dialog open={dialog.isOpen} onOpenChange={handleCancel}>
			<DialogContent className={cn(className)}>
				<DialogHeader>
					<DialogTitle className="text-xl">{title}</DialogTitle>
					<DialogDescription className="text-base text-muted-foreground">
						{description}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="mt-4">
					<Button variant="outline" onClick={handleCancel}>
						{cancelText}
					</Button>
					<Button variant={confirmVariant} onClick={handleConfirm}>
						{confirmText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
