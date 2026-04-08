/**
 * RichEditor
 *
 * Requires these CSS additions in globals.css — see code-highlight.css.
 * Headings: type # / ## / ### or use the toolbar.
 * Code blocks: type ``` or ```js, or use the toolbar.
 * Mentions: type @<query> to trigger the suggestion dropdown.
 */
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
	// Memoize extensions — fetchMentionUsers must be stable at the call site (useCallback)
	const extensions = useMemo(
		() => buildEditorExtensions(fetchMentionUsers, placeholder),
		[fetchMentionUsers, placeholder]
	);

	const editor = useEditor({
		extensions,
		content: initialContent,
		editable: !readOnly,
		immediatelyRender: false, // prevents Next.js SSR hydration mismatch

		onUpdate: ({ editor: e }) => {
			onUpdate?.({
				json: e.getJSON(),
				html: e.getHTML(),
				text: e.getText(),
			});
		},
	});

	// Reactive reads via useEditorState — avoids unnecessary re-renders
	const { characterCount, isOverLimit } = useEditorState({
		editor,
		selector: (ctx) => {
			if (!ctx.editor) return { characterCount: 0, isOverLimit: false };
			const count = ctx.editor.storage.characterCount.characters() as number;
			return {
				characterCount: count,
				isOverLimit: count > CHARACTER_LIMIT,
			};
		},
	}) ?? { characterCount: 0, isOverLimit: false };

	// Open links on click in edit mode without navigating away
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
			{/* Toolbar — hidden in readOnly mode */}
			{!readOnly && <Toolbar editor={editor} />}

			{/* Editor content area */}
			<div onClick={handleLinkClick} className="flex-1">
				<EditorContent
					editor={editor}
					className={cn(
						"prose prose-sm dark:prose-invert max-w-none",
						"min-h-[100px] max-h-[400px] overflow-y-auto",
						"px-4 py-3",
						// Reset outline on the inner .tiptap div
						"[&_.tiptap]:outline-none",
						// Paragraph spacing
						"[&_.tiptap_p]:my-1 [&_.tiptap_p:first-child]:mt-0 [&_.tiptap_p:last-child]:mb-0",
						// Lists
						"[&_.tiptap_ul]:pl-5 [&_.tiptap_ol]:pl-5",
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

			{/* Footer — character count (edit mode only) */}
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
