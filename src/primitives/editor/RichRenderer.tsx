import type { JSONContent } from "@tiptap/core";
import { generateHTML } from "@tiptap/core";
import parse, { type DOMNode, Element } from "html-react-parser";
import { MentionHoverCard } from "@/components/editor/MentionHoverCard";
import { cn } from "@/lib/client/utils";
import type { RichRendererProps } from "@/primitives/editor/types";
import { baseExtensions } from "./extensions";
import { LinkPreview } from "./LinkPreview";

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

export function RichRenderer({ content, fetchMentionUser }: RichRendererProps) {
	const json = content as JSONContent;
	const firstLink = extractFirstLink(json);
	const html = generateHTML(json, baseExtensions);

	const rendered = parse(html, {
		replace(domNode: DOMNode) {
			if (!(domNode instanceof Element)) return undefined;

			const mentionId = domNode.attribs["data-mention-id"];
			if (!mentionId) return undefined;

			// Guard against the literal string "undefined" leaking into the label.
			const raw = domNode.attribs["data-mention-label"];
			const mentionLabel = raw && raw !== "undefined" ? raw : mentionId;

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
					"[&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
					// Lists — same fix as RichEditor
					"[&_ul]:list-disc [&_ul]:pl-5",
					"[&_ol]:list-decimal [&_ol]:pl-5",
					"[&_li]:mb-1 [&_li]:min-h-[1.4em]",
					"[&_li_>_p]:my-0",
					// Blockquote
					"[&_blockquote]:border-l-2 [&_blockquote]:border-border",
					"[&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
					// Inline code
					"[&_code:not(pre_code)]:bg-muted [&_code:not(pre_code)]:px-1",
					"[&_code:not(pre_code)]:rounded [&_code:not(pre_code)]:text-sm",
					// Headings
					"[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2",
					"[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1.5",
					"[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1"
				)}
			>
				{rendered}
			</div>

			{firstLink && <LinkPreview url={firstLink} />}
		</div>
	);
}
