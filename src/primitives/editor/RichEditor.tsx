/** biome-ignore-all lint/a11y/noStaticElementInteractions: editor wrapper needs click capture */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: link interception is pointer-only */
"use client";

import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { useCallback, useMemo } from "react";
import { cn } from "@/lib/client/utils";
import type { RichEditorProps } from "@/primitives/editor/types";
import { buildEditorExtensions, CHARACTER_LIMIT } from "./extensions";
import { Toolbar } from "./Toolbar";

export function RichEditor({
	initialContent,
	placeholder,
	onUpdate,
	fetchMentionUsers,
	readOnly = false,
}: RichEditorProps) {
	const extensions = useMemo(
		() => buildEditorExtensions(fetchMentionUsers, placeholder),
		[fetchMentionUsers, placeholder]
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
			return { characterCount: count, isOverLimit: count > CHARACTER_LIMIT };
		},
	}) ?? { characterCount: 0, isOverLimit: false };

	const handleLinkClick = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (readOnly) return;
			const target = e.target as HTMLElement;
			const link = target.closest("a.tiptap-link");
			if (link) {
				e.preventDefault();
				window.open(
					(link as HTMLAnchorElement).href,
					"_blank",
					"noopener,noreferrer"
				);
			}
		},
		[readOnly]
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

			<div onClick={handleLinkClick} className="flex-1">
				<EditorContent
					editor={editor}
					className={cn(
						"prose prose-sm dark:prose-invert max-w-none",
						"min-h-[100px] max-h-[400px] overflow-y-auto",
						"px-4 py-3",
						"[&_.tiptap]:outline-none",
						// Paragraphs
						"[&_.tiptap_p]:my-1 [&_.tiptap_p:first-child]:mt-0 [&_.tiptap_p:last-child]:mb-0",
						// ── Lists ─────────────────────────────────────────────
						// FIX: Tailwind prose resets list-style-type to none.
						// Restore bullet/number markers explicitly.
						"[&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-5",
						"[&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-5",
						// FIX: "content overlaps the empty list item" bug.
						//
						// When a list item contains an empty <p>, the <p>'s my-1 margin
						// collapses and the <li> shrinks to near-zero height. The list
						// marker still renders at the top-left of that zero-height box,
						// and the next block element's text flows right under the marker.
						//
						// Solution:
						//  1. Zero-out paragraph margins INSIDE list items (the li itself
						//     provides the vertical rhythm via mb-1).
						//  2. Give each li a min-height equal to one line so the marker
						//     always has visible space even when the paragraph is empty.
						"[&_.tiptap_li]:mb-1 [&_.tiptap_li]:min-h-[1.4em]",
						"[&_.tiptap_li_>_p]:my-0",
						// ──────────────────────────────────────────────────────
						// Blockquote
						"[&_.tiptap_blockquote]:border-l-2 [&_.tiptap_blockquote]:border-border",
						"[&_.tiptap_blockquote]:pl-3 [&_.tiptap_blockquote]:text-muted-foreground",
						// Inline code
						"[&_.tiptap_code:not(pre_code)]:bg-muted [&_.tiptap_code:not(pre_code)]:px-1",
						"[&_.tiptap_code:not(pre_code)]:rounded",
						// Headings
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
								: characterCount > CHARACTER_LIMIT * 0.85
									? "text-amber-500"
									: "text-muted-foreground"
						)}
					>
						{characterCount} / {CHARACTER_LIMIT}
					</span>
				</div>
			)}
		</div>
	);
}
