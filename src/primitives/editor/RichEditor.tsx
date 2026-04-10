/** biome-ignore-all lint/a11y/noStaticElementInteractions: editor wrapper needs click capture */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: link interception is pointer-only */
"use client";

import type { Editor } from "@tiptap/react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import {
	Bold,
	Braces,
	Code,
	Heading1,
	Heading2,
	Heading3,
	Italic,
	Link2,
	Link2Off,
	List,
	ListOrdered,
	Quote,
	Redo2,
	Strikethrough,
	Undo2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/client/utils";
import {
	AMBER_WARNING_THRESHOLD,
	buildEditorExtensions,
	DEFAULT_CHARACTER_LIMIT,
} from "./extensions";
import type { RichEditorProps } from "./types";

// ─── LinkDialog ───────────────────────────────────────────────────────────────

interface LinkDialogProps {
	editor: Editor;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function LinkDialog({ editor, open, onOpenChange }: LinkDialogProps) {
	const [url, setUrl] = useState("");

	const { isActiveLink } = useEditorState({
		editor,
		selector: (ctx) => ({
			isActiveLink: ctx.editor?.isActive("link") ?? false,
		}),
	}) ?? { isActiveLink: false };

	useEffect(() => {
		if (open) {
			const current = editor.getAttributes("link").href as string | undefined;
			setUrl(current ?? "");
		}
	}, [open, editor]);

	const handleApply = () => {
		const trimmed = url.trim();
		if (!trimmed) {
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

// ─── ToolbarButton ────────────────────────────────────────────────────────────

interface ToolbarButtonProps {
	onClick: () => void;
	isActive?: boolean;
	disabled?: boolean;
	tooltip: string;
	children: React.ReactNode;
}

function ToolbarButton({
	onClick,
	isActive = false,
	disabled = false,
	tooltip,
	children,
}: ToolbarButtonProps) {
	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Toggle
						size="sm"
						pressed={isActive}
						onPressedChange={onClick}
						disabled={disabled}
						aria-label={tooltip}
						className="h-8 w-8 p-0 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
					>
						{children}
					</Toggle>
				}
			/>
			<TooltipContent side="bottom" className="text-xs">
				{tooltip}
			</TooltipContent>
		</Tooltip>
	);
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────

function Toolbar({ editor }: { editor: Editor }) {
	const [linkDialogOpen, setLinkDialogOpen] = useState(false);

	const state = useEditorState({
		editor,
		selector: (ctx) => {
			const e = ctx.editor;
			if (!e) return null;
			return {
				isBold: e.isActive("bold"),
				isItalic: e.isActive("italic"),
				isStrike: e.isActive("strike"),
				isCode: e.isActive("code"),
				isCodeBlock: e.isActive("codeBlock"),
				isLink: e.isActive("link"),
				isBulletList: e.isActive("bulletList"),
				isOrderedList: e.isActive("orderedList"),
				isBlockquote: e.isActive("blockquote"),
				isH1: e.isActive("heading", { level: 1 }),
				isH2: e.isActive("heading", { level: 2 }),
				isH3: e.isActive("heading", { level: 3 }),
				canBold: e.can().toggleBold(),
				canItalic: e.can().toggleItalic(),
				canStrike: e.can().toggleStrike(),
				canCode: e.can().toggleCode(),
				canUndo: e.can().undo(),
				canRedo: e.can().redo(),
			};
		},
	});

	const {
		isBold = false,
		isItalic = false,
		isStrike = false,
		isCode = false,
		isCodeBlock = false,
		isLink = false,
		isBulletList = false,
		isOrderedList = false,
		isBlockquote = false,
		isH1 = false,
		isH2 = false,
		isH3 = false,
		canBold = false,
		canItalic = false,
		canStrike = false,
		canCode = false,
		canUndo = false,
		canRedo = false,
	} = state ?? {};

	const openLinkDialog = useCallback(() => setLinkDialogOpen(true), []);

	return (
		<>
			<div className="flex items-center gap-0.5 flex-wrap p-1.5 border-b bg-muted/30">
				<ToolbarButton
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 1 }).run()
					}
					isActive={isH1}
					tooltip="Heading 1"
				>
					<Heading1 className="h-3.5 w-3.5" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 2 }).run()
					}
					isActive={isH2}
					tooltip="Heading 2"
				>
					<Heading2 className="h-3.5 w-3.5" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 3 }).run()
					}
					isActive={isH3}
					tooltip="Heading 3"
				>
					<Heading3 className="h-3.5 w-3.5" />
				</ToolbarButton>

				<Separator orientation="vertical" className="mx-1 h-6" />

				<ToolbarButton
					onClick={() => editor.chain().focus().toggleBold().run()}
					isActive={isBold}
					disabled={!canBold}
					tooltip="Bold (⌘B)"
				>
					<Bold className="h-3.5 w-3.5" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleItalic().run()}
					isActive={isItalic}
					disabled={!canItalic}
					tooltip="Italic (⌘I)"
				>
					<Italic className="h-3.5 w-3.5" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleStrike().run()}
					isActive={isStrike}
					disabled={!canStrike}
					tooltip="Strikethrough"
				>
					<Strikethrough className="h-3.5 w-3.5" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleCode().run()}
					isActive={isCode}
					disabled={!canCode}
					tooltip="Inline code"
				>
					<Code className="h-3.5 w-3.5" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleCodeBlock().run()}
					isActive={isCodeBlock}
					tooltip="Code block (```)"
				>
					<Braces className="h-3.5 w-3.5" />
				</ToolbarButton>

				<Separator orientation="vertical" className="mx-1 h-6" />

				<ToolbarButton
					onClick={openLinkDialog}
					isActive={isLink}
					tooltip={isLink ? "Edit link" : "Add link (⌘K)"}
				>
					{isLink ? (
						<Link2Off className="h-3.5 w-3.5" />
					) : (
						<Link2 className="h-3.5 w-3.5" />
					)}
				</ToolbarButton>

				<Separator orientation="vertical" className="mx-1 h-6" />

				<ToolbarButton
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					isActive={isBulletList}
					tooltip="Bullet list"
				>
					<List className="h-3.5 w-3.5" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					isActive={isOrderedList}
					tooltip="Numbered list"
				>
					<ListOrdered className="h-3.5 w-3.5" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleBlockquote().run()}
					isActive={isBlockquote}
					tooltip="Blockquote"
				>
					<Quote className="h-3.5 w-3.5" />
				</ToolbarButton>

				<Separator orientation="vertical" className="mx-1 h-6" />

				<ToolbarButton
					onClick={() => editor.chain().focus().undo().run()}
					disabled={!canUndo}
					tooltip="Undo (⌘Z)"
				>
					<Undo2 className="h-3.5 w-3.5" />
				</ToolbarButton>
				<ToolbarButton
					onClick={() => editor.chain().focus().redo().run()}
					disabled={!canRedo}
					tooltip="Redo (⌘⇧Z)"
				>
					<Redo2 className="h-3.5 w-3.5" />
				</ToolbarButton>
			</div>

			<LinkDialog
				editor={editor}
				open={linkDialogOpen}
				onOpenChange={setLinkDialogOpen}
			/>
		</>
	);
}

// ─── RichEditor ───────────────────────────────────────────────────────────────

export function RichEditor({
	initialContent,
	placeholder,
	maxChars = DEFAULT_CHARACTER_LIMIT,
	onUpdate,
	fetchMentionUsers,
	readOnly = false,
}: RichEditorProps) {
	const extensions = useMemo(
		() => buildEditorExtensions(fetchMentionUsers, placeholder, maxChars),
		[fetchMentionUsers, placeholder, maxChars]
	);

	const editor = useEditor({
		extensions,
		content: initialContent,
		editable: !readOnly,
		immediatelyRender: false,
		onUpdate: ({ editor: e }) => {
			onUpdate?.({
				json: e.getJSON(),
				html: e.getHTML(),
				text: e.getText(),
			});
		},
	});

	const { characterCount, isOverLimit } = useEditorState({
		editor,
		selector: (ctx) => {
			if (!ctx.editor) return { characterCount: 0, isOverLimit: false };
			const count = ctx.editor.storage.characterCount.characters() as number;
			return { characterCount: count, isOverLimit: count >= maxChars };
		},
	}) ?? { characterCount: 0, isOverLimit: false };

	const handleAreaClick = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (readOnly || !editor) return;

			const tiptapEl = (e.currentTarget as HTMLElement).querySelector(
				".tiptap"
			);
			if (tiptapEl && !tiptapEl.contains(e.target as Node)) {
				editor.commands.focus("end");
				return;
			}

			const link = (e.target as HTMLElement).closest("a.tiptap-link");
			if (link) {
				e.preventDefault();
				window.open(
					(link as HTMLAnchorElement).href,
					"_blank",
					"noopener,noreferrer"
				);
			}
		},
		[readOnly, editor]
	);

	if (!editor) return null;

	return (
		<div
			className={cn(
				"rounded-lg border bg-card text-card-foreground shadow-sm",
				"flex flex-col overflow-hidden",
				isOverLimit && "border-destructive"
			)}
		>
			{!readOnly && <Toolbar editor={editor} />}

			<div
				onClick={handleAreaClick}
				className="flex-1 min-h-[100px] cursor-text"
			>
				<EditorContent
					editor={editor}
					className={cn(
						"prose prose-sm dark:prose-invert max-w-none",
						"max-h-[400px] overflow-y-auto",
						"px-4 py-3",
						"[&_.tiptap]:outline-none [&_.tiptap]:min-h-[76px]",
						"[&_.tiptap_p]:my-1 [&_.tiptap_p:first-child]:mt-0 [&_.tiptap_p:last-child]:mb-0",
						"[&_.tiptap_blockquote]:border-l-2 [&_.tiptap_blockquote]:border-border",
						"[&_.tiptap_blockquote]:pl-3 [&_.tiptap_blockquote]:text-muted-foreground",
						"[&_.tiptap_code:not(pre_code)]:bg-muted [&_.tiptap_code:not(pre_code)]:px-1",
						"[&_.tiptap_code:not(pre_code)]:rounded",
						"[&_.tiptap_h1]:text-2xl [&_.tiptap_h1]:font-bold [&_.tiptap_h1]:mt-4 [&_.tiptap_h1]:mb-2",
						"[&_.tiptap_h2]:text-xl [&_.tiptap_h2]:font-semibold [&_.tiptap_h2]:mt-3 [&_.tiptap_h2]:mb-1.5",
						"[&_.tiptap_h3]:text-base [&_.tiptap_h3]:font-semibold [&_.tiptap_h3]:mt-2 [&_.tiptap_h3]:mb-1"
					)}
				/>
			</div>

			{!readOnly && (
				<div className="flex items-center justify-end px-4 py-2 border-t bg-muted/20">
					<span
						className={cn(
							"text-xs tabular-nums",
							isOverLimit
								? "text-destructive font-medium"
								: characterCount > maxChars * AMBER_WARNING_THRESHOLD
									? "text-amber-500"
									: "text-muted-foreground"
						)}
					>
						{characterCount} / {maxChars}
					</span>
				</div>
			)}
		</div>
	);
}
