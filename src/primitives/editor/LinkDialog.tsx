"use client";

import type { Editor } from "@tiptap/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LinkDialogProps {
	editor: Editor;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function LinkDialog({ editor, open, onOpenChange }: LinkDialogProps) {
	const [url, setUrl] = useState("");

	// Populate with the current link href whenever the dialog opens.
	// Using useEffect (not useState initializer) so it re-runs each time
	// the dialog opens, even if the component doesn't remount.
	useEffect(() => {
		if (open) {
			const current = editor.getAttributes("link").href as string | undefined;
			setUrl(current ?? "");
		}
	}, [open, editor]);

	const isActiveLink = editor.isActive("link");

	const handleApply = () => {
		const trimmed = url.trim();
		if (!trimmed) {
			// Empty URL → treat as "remove link"
			editor.chain().focus().unsetLink().run();
		} else {
			const href = /^https?:\/\//i.test(trimmed)
				? trimmed
				: `https://${trimmed}`;
			editor.chain().focus().setLink({ href }).run();
		}
		onOpenChange(false);
	};

	const handleRemove = () => {
		editor.chain().focus().unsetLink().run();
		onOpenChange(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleApply();
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>
						{isActiveLink ? "Edit link" : "Insert link"}
					</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-2 py-1">
					<Label htmlFor="link-url" className="text-sm">
						URL
					</Label>
					<Input
						id="link-url"
						type="url"
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="https://example.com"
						autoFocus
						className="font-mono text-sm"
					/>
				</div>

				<DialogFooter className="gap-2 sm:gap-2">
					{isActiveLink && (
						<Button
							type="button"
							variant="destructive"
							size="sm"
							onClick={handleRemove}
						>
							Remove link
						</Button>
					)}
					<Button type="button" size="sm" onClick={handleApply}>
						{url.trim() ? "Apply" : "Remove link"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
