"use client";

import { useEditorState } from "@tiptap/react";
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
import { useCallback, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { LinkDialog } from "./LinkDialog";
import type { ToolbarProps } from "./types";

// ─────────────────────────────────────────────
// ToolbarButton
// ─────────────────────────────────────────────

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
			{/*
			 * Base UI's TooltipTrigger does NOT support `asChild` (that's a Radix pattern).
			 * Base UI uses `render` prop to replace the host element — forwarding its
			 * internal ref + event props onto the Toggle's <button>, so only ONE
			 * <button> exists in the DOM (fixes the hydration "button in button" error).
			 */}
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

// ─────────────────────────────────────────────
// Toolbar
// ─────────────────────────────────────────────

export function Toolbar({ editor }: ToolbarProps) {
	const [linkDialogOpen, setLinkDialogOpen] = useState(false);

	// ─────────────────────────────────────────
	// FIX: Toolbar not aware of cursor position
	//
	// In Tiptap v3, `shouldRerenderOnTransaction` is OFF by default, so the
	// editor object doesn't trigger React re-renders on selection changes.
	// Reading `editor.isActive(...)` directly in JSX only reflects the state
	// at the last render — not after the user moves their cursor.
	//
	// `useEditorState` subscribes to editor transactions and re-renders this
	// component whenever any of the selected values change. This makes the
	// toolbar instantly responsive to cursor position, entering/leaving code
	// blocks, toggling marks, etc.
	// ─────────────────────────────────────────
	const {
		isBold,
		isItalic,
		isStrike,
		isCode,
		isCodeBlock,
		isLink,
		isBulletList,
		isOrderedList,
		isBlockquote,
		isH1,
		isH2,
		isH3,
		canBold,
		canItalic,
		canStrike,
		canCode,
		canUndo,
		canRedo,
	} = useEditorState({
		editor,
		selector: (ctx) => {
			const e = ctx.editor;
			if (!e) {
				return {
					isBold: false,
					isItalic: false,
					isStrike: false,
					isCode: false,
					isCodeBlock: false,
					isLink: false,
					isBulletList: false,
					isOrderedList: false,
					isBlockquote: false,
					isH1: false,
					isH2: false,
					isH3: false,
					canBold: false,
					canItalic: false,
					canStrike: false,
					canCode: false,
					canUndo: false,
					canRedo: false,
				};
			}
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
				// can() checks are also cursor-dependent (e.g. can't bold inside a code block)
				canBold: e.can().toggleBold(),
				canItalic: e.can().toggleItalic(),
				canStrike: e.can().toggleStrike(),
				canCode: e.can().toggleCode(),
				canUndo: e.can().undo(),
				canRedo: e.can().redo(),
			};
		},
	}) ?? {
		isBold: false,
		isItalic: false,
		isStrike: false,
		isCode: false,
		isCodeBlock: false,
		isLink: false,
		isBulletList: false,
		isOrderedList: false,
		isBlockquote: false,
		isH1: false,
		isH2: false,
		isH3: false,
		canBold: false,
		canItalic: false,
		canStrike: false,
		canCode: false,
		canUndo: false,
		canRedo: false,
	};

	// FIX: Replace window.prompt with a proper Dialog — see LinkDialog.tsx
	const openLinkDialog = useCallback(() => {
		setLinkDialogOpen(true);
	}, []);

	return (
		<>
			{/*
			 * Outer TooltipProvider removed — providers.tsx already wraps the whole
			 * app in one. Double-provider shows as two nested <TooltipProvider>
			 * elements in the error log.
			 */}
			<div className="flex items-center gap-0.5 flex-wrap p-1.5 border-b bg-muted/30">
				{/* ── Headings ── */}
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

				{/* ── Text formatting ── */}
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

				{/* ── Link ── */}
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

				{/* ── Lists ── */}
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

				{/* ── History ── */}
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

			{/* Link dialog — rendered outside the toolbar div to avoid stacking issues */}
			<LinkDialog
				editor={editor}
				open={linkDialogOpen}
				onOpenChange={setLinkDialogOpen}
			/>
		</>
	);
}
