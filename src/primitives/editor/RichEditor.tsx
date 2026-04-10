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

	const handleAreaClick = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (readOnly || !editor) return;

			// ── Click-anywhere-to-focus ────────────────────────────────────────
			// EditorContent only renders the .tiptap contenteditable div over the
			// area that contains document nodes. Clicking the padding around the
			// text (the flex-1 wrapper below) doesn't land inside .tiptap so the
			// browser never focuses the editor. We fix this by checking whether the
			// click target is *outside* the .tiptap div and focusing manually when
			// it is. If it's already inside .tiptap, the browser handled it natively
			// so we don't interfere.
			const tiptapEl = (e.currentTarget as HTMLElement).querySelector(".tiptap");
			if (tiptapEl && !tiptapEl.contains(e.target as Node)) {
				editor.commands.focus("end");
				return;
			}

			// ── Link interception in edit mode ────────────────────────────────
			// Open links without navigating away when the editor is editable.
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

			{/*
			 * This wrapper fills the card height. Clicking anywhere inside it
			 * (including the empty space below the last paragraph) triggers
			 * handleAreaClick which focuses the editor at the end.
			 */}
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
						// Paragraphs
						"[&_.tiptap_p]:my-1 [&_.tiptap_p:first-child]:mt-0 [&_.tiptap_p:last-child]:mb-0",
						// Lists: marker + overlap fix come from globals.css
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
