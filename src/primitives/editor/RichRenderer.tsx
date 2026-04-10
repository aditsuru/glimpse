/** biome-ignore-all lint/suspicious/noExplicitAny: none */
import type { JSONContent } from "@tiptap/core";
import { generateHTML } from "@tiptap/core";
import parse from "html-react-parser";
import { MentionHoverCard } from "@/components/editor/MentionHoverCard";
import { cn } from "@/lib/client/utils";
import type { RichRendererProps } from "@/primitives/editor/types";
import { CodeBlockRendered } from "./CodeBlockRendered";
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

// Safely extract text without relying on instanceof Element
function extractText(nodes: any[]): string {
	return nodes
		.map((node) => {
			if (node.type === "text") return node.data || "";
			if (node.type === "tag" && node.children)
				return extractText(node.children);
			return "";
		})
		.join("");
}

export function RichRenderer({ content, fetchMentionUser }: RichRendererProps) {
	const json = content as JSONContent;
	const firstLink = extractFirstLink(json);
	const html = generateHTML(json, baseExtensions);

	const rendered = parse(html, {
		replace(domNode: any) {
			// CRITICAL FIX: Do not use `instanceof Element`. Use `type === 'tag'`
			if (domNode.type !== "tag") return;

			// ── Code block ────────────────────────────────────────────────────
			if (
				domNode.name === "pre" &&
				(domNode.attribs?.class || "").includes("tiptap-code-block")
			) {
				const codeEl = domNode.children?.find(
					(c: any) => c.type === "tag" && c.name === "code"
				);

				const langMatch = (codeEl?.attribs?.class || "").match(
					/language-(\w+)/
				);
				const language = langMatch?.[1] || "plaintext";
				const codeText = codeEl ? extractText(codeEl.children) : "";

				return (
					<CodeBlockRendered
						key={Math.random()}
						language={language}
						codeText={codeText}
					/>
				);
			}

			// ── Mention ───────────────────────────────────────────────────────
			if (
				domNode.name === "a" &&
				(domNode.attribs?.["data-mention-id"] ||
					(domNode.attribs?.class || "").includes("tiptap-mention"))
			) {
				const mentionId = domNode.attribs["data-mention-id"] || "unknown";
				const raw = domNode.attribs["data-mention-label"];
				const mentionLabel = raw && raw !== "undefined" ? raw : mentionId;

				return (
					<MentionHoverCard
						key={Math.random()}
						id={mentionId}
						label={mentionLabel}
						fetchUser={fetchMentionUser}
					/>
				);
			}
		},
	});

	return (
		<div>
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
