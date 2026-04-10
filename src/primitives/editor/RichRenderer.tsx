import type { JSONContent } from "@tiptap/core";
import { generateHTML } from "@tiptap/core";
import parse, { type DOMNode, domToReact, Element } from "html-react-parser";
import { MentionHoverCard } from "@/components/editor/MentionHoverCard";
import { cn } from "@/lib/client/utils";
import type { RichRendererProps } from "@/primitives/editor/types";
import { CodeBlockRendered } from "./CodeBlockRendered";
import { baseExtensions } from "./extensions";
import { LinkPreview } from "./LinkPreview";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

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

/** Extract plain text from a parsed DOMNode tree (used for clipboard copy). */
function extractText(nodes: DOMNode[]): string {
	return nodes
		.map((node) => {
			// Text node: has a `data` string property
			if (
				"data" in node &&
				typeof (node as { data: unknown }).data === "string"
			) {
				return (node as { data: string }).data;
			}
			// Element node: recurse into children
			if (node instanceof Element) {
				return extractText(node.children as DOMNode[]);
			}
			return "";
		})
		.join("");
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function RichRenderer({ content, fetchMentionUser }: RichRendererProps) {
	const json = content as JSONContent;
	const firstLink = extractFirstLink(json);
	const html = generateHTML(json, baseExtensions);

	const rendered = parse(html, {
		replace(domNode: DOMNode) {
			if (!(domNode instanceof Element)) return undefined;

			// ── Code block replacement ────────────────────────────────────────
			// generateHTML emits <pre class="tiptap-code-block not-prose"><code ...>
			// We replace it with CodeBlockRendered to add the copy button + header bar,
			// matching the editor's CodeBlockView node view exactly.
			if (
				domNode.name === "pre" &&
				(domNode.attribs.class ?? "").includes("tiptap-code-block")
			) {
				const codeEl = domNode.children.find(
					(c): c is Element => c instanceof Element && c.name === "code"
				);

				const langMatch = (codeEl?.attribs.class ?? "").match(/language-(\w+)/);
				const language = langMatch?.[1] ?? "plaintext";
				const codeText = codeEl
					? extractText(codeEl.children as DOMNode[])
					: "";
				const codeContent = codeEl
					? domToReact(codeEl.children as DOMNode[])
					: null;

				return (
					<CodeBlockRendered language={language} codeText={codeText}>
						{codeContent}
					</CodeBlockRendered>
				);
			}

			// ── Mention replacement ───────────────────────────────────────────
			const mentionId = domNode.attribs["data-mention-id"];
			if (!mentionId) return undefined;

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
			{/*
			 * .tiptap-content is the renderer's counterpart to .tiptap (editor div).
			 * List styles, li fixes, etc. in globals.css target both classes so the
			 * editor and renderer always look identical without duplicating CSS.
			 */}
			<div
				className={cn(
					"tiptap-content prose prose-sm dark:prose-invert max-w-none"
				)}
			>
				{rendered}
			</div>

			{firstLink && <LinkPreview url={firstLink} />}
		</div>
	);
}
