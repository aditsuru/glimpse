/**
 * RichRenderer
 *
 * Server-component-compatible renderer for TipTap JSON content.
 * Parses rendered HTML and swaps @mention <a> elements with the
 * interactive <MentionHoverCard /> client component.
 *
 * Dependencies: html-react-parser
 *   npm i html-react-parser
 */

import type { JSONContent } from "@tiptap/core";
import { generateHTML } from "@tiptap/core";
import parse, { type DOMNode, Element } from "html-react-parser";
import { MentionHoverCard } from "@/components/editor/MentionHoverCard";
import { cn } from "@/lib/client/utils";
import type { RichRendererProps } from "@/primitives/editor/types";
import { baseExtensions } from "./extensions";
import { LinkPreview } from "./LinkPreview";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Recursively find the first href from a link mark in TipTap JSON. */
function extractFirstLink(node: JSONContent): string | null {
	if (node.marks) {
		for (const mark of node.marks) {
			if (mark.type === "link" && typeof mark.attrs?.href === "string") {
				return mark.attrs.href;
			}
		}
	}
	if (node.content) {
		for (const child of node.content) {
			const found = extractFirstLink(child);
			if (found) return found;
		}
	}
	return null;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function RichRenderer({ content, fetchMentionUser }: RichRendererProps) {
	const json = content as JSONContent;
	const firstLink = extractFirstLink(json);

	// generateHTML is SSR-safe (no DOM required)
	const html = generateHTML(json, baseExtensions);

	// Parse HTML → React elements, replacing @mention anchors with hover cards
	const rendered = parse(html, {
		replace(domNode: DOMNode) {
			if (!(domNode instanceof Element)) return undefined;

			const mentionId = domNode.attribs["data-mention-id"];
			if (!mentionId) return undefined;

			const mentionLabel = domNode.attribs["data-mention-label"] ?? mentionId;

			return (
				<MentionHoverCard
					id={mentionId}
					label={mentionLabel}
					fetchUser={fetchMentionUser}
				/>
			);
		},
	});

	return (
		<div>
			<div
				className={cn(
					"prose prose-sm dark:prose-invert max-w-none",
					// Paragraph spacing
					"[&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
					// Lists
					"[&_ul]:pl-5 [&_ol]:pl-5",
					// Blockquote
					"[&_blockquote]:border-l-2 [&_blockquote]:border-border",
					"[&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
					// Inline code (NOT code blocks — those use .tiptap-code-block)
					"[&_code:not(pre_code)]:bg-muted [&_code:not(pre_code)]:px-1",
					"[&_code:not(pre_code)]:rounded [&_code:not(pre_code)]:text-sm",
					// Headings
					"[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2",
					"[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1.5",
					"[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1"
					// Mention chips & links are styled via globals.css
				)}
			>
				{rendered}
			</div>

			{/* Link preview card — only for the first URL found */}
			{firstLink && <LinkPreview url={firstLink} />}
		</div>
	);
}
