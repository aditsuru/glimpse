"use client";

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
import { useCallback } from "react";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
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
			<TooltipTrigger>
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
			</TooltipTrigger>
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
	// ── Link handling ──────────────────────────────────────────
	const handleLink = useCallback(() => {
		if (editor.isActive("link")) {
			editor.chain().focus().unsetLink().run();
			return;
		}

		const url = window.prompt("Enter URL");
		if (!url) return;

		const href = url.startsWith("http") ? url : `https://${url}`;
		editor.chain().focus().setLink({ href }).run();
	}, [editor]);

	return (
		<TooltipProvider>
			<div className="flex items-center gap-0.5 flex-wrap p-1.5 border-b bg-muted/30">
				{/* ── Headings ── */}
				<ToolbarButton
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 1 }).run()
					}
					isActive={editor.isActive("heading", { level: 1 })}
					tooltip="Heading 1"
				>
					<Heading1 className="h-3.5 w-3.5" />
				</ToolbarButton>

				<ToolbarButton
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 2 }).run()
					}
					isActive={editor.isActive("heading", { level: 2 })}
					tooltip="Heading 2"
				>
					<Heading2 className="h-3.5 w-3.5" />
				</ToolbarButton>

				<ToolbarButton
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 3 }).run()
					}
					isActive={editor.isActive("heading", { level: 3 })}
					tooltip="Heading 3"
				>
					<Heading3 className="h-3.5 w-3.5" />
				</ToolbarButton>

				<Separator orientation="vertical" className="mx-1 h-6" />

				{/* ── Text formatting ── */}
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleBold().run()}
					isActive={editor.isActive("bold")}
					disabled={!editor.can().toggleBold()}
					tooltip="Bold (⌘B)"
				>
					<Bold className="h-3.5 w-3.5" />
				</ToolbarButton>

				<ToolbarButton
					onClick={() => editor.chain().focus().toggleItalic().run()}
					isActive={editor.isActive("italic")}
					disabled={!editor.can().toggleItalic()}
					tooltip="Italic (⌘I)"
				>
					<Italic className="h-3.5 w-3.5" />
				</ToolbarButton>

				<ToolbarButton
					onClick={() => editor.chain().focus().toggleStrike().run()}
					isActive={editor.isActive("strike")}
					disabled={!editor.can().toggleStrike()}
					tooltip="Strikethrough"
				>
					<Strikethrough className="h-3.5 w-3.5" />
				</ToolbarButton>

				<ToolbarButton
					onClick={() => editor.chain().focus().toggleCode().run()}
					isActive={editor.isActive("code")}
					disabled={!editor.can().toggleCode()}
					tooltip="Inline code"
				>
					<Code className="h-3.5 w-3.5" />
				</ToolbarButton>

				<ToolbarButton
					onClick={() => editor.chain().focus().toggleCodeBlock().run()}
					isActive={editor.isActive("codeBlock")}
					tooltip="Code block (```)​"
				>
					<Braces className="h-3.5 w-3.5" />
				</ToolbarButton>

				<Separator orientation="vertical" className="mx-1 h-6" />

				{/* ── Link ── */}
				<ToolbarButton
					onClick={handleLink}
					isActive={editor.isActive("link")}
					tooltip={editor.isActive("link") ? "Remove link" : "Add link (⌘K)"}
				>
					{editor.isActive("link") ? (
						<Link2Off className="h-3.5 w-3.5" />
					) : (
						<Link2 className="h-3.5 w-3.5" />
					)}
				</ToolbarButton>

				<Separator orientation="vertical" className="mx-1 h-6" />

				{/* ── Lists ── */}
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					isActive={editor.isActive("bulletList")}
					tooltip="Bullet list"
				>
					<List className="h-3.5 w-3.5" />
				</ToolbarButton>

				<ToolbarButton
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					isActive={editor.isActive("orderedList")}
					tooltip="Numbered list"
				>
					<ListOrdered className="h-3.5 w-3.5" />
				</ToolbarButton>

				<ToolbarButton
					onClick={() => editor.chain().focus().toggleBlockquote().run()}
					isActive={editor.isActive("blockquote")}
					tooltip="Blockquote"
				>
					<Quote className="h-3.5 w-3.5" />
				</ToolbarButton>

				<Separator orientation="vertical" className="mx-1 h-6" />

				{/* ── History ── */}
				<ToolbarButton
					onClick={() => editor.chain().focus().undo().run()}
					disabled={!editor.can().undo()}
					tooltip="Undo (⌘Z)"
				>
					<Undo2 className="h-3.5 w-3.5" />
				</ToolbarButton>

				<ToolbarButton
					onClick={() => editor.chain().focus().redo().run()}
					disabled={!editor.can().redo()}
					tooltip="Redo (⌘⇧Z)"
				>
					<Redo2 className="h-3.5 w-3.5" />
				</ToolbarButton>
			</div>
		</TooltipProvider>
	);
}
