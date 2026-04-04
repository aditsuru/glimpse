import Link from "@tiptap/extension-link";
import Mention from "@tiptap/extension-mention";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";

type MarkAttrs = Record<string, string | null | undefined>;

type TiptapMark = {
	type: string;
	attrs?: MarkAttrs;
};

type TiptapNode = {
	type: string;
	attrs?: Record<string, string>;
	content?: TiptapNode[];
	text?: string;
	marks?: TiptapMark[];
};

export type PostSegment =
	| { type: "html"; html: string }
	| { type: "code"; lang: string; code: string }
	| { type: "embed"; url: string };

// Fresh instances per call — never module-level, avoids tiptap's
// internal name-deduplication warning across generateHTML calls.
function makeExtensions() {
	return [
		StarterKit,
		Link.configure({
			openOnClick: false,
			autolink: true,
			HTMLAttributes: {
				rel: "noopener noreferrer",
				target: "_blank",
			},
		}),
		Mention.configure({
			renderHTML({ node }) {
				return [
					"a",
					{ href: `/user/${node.attrs.label}`, class: "mention" },
					`@${node.attrs.label}`,
				];
			},
		}),
	];
}

function getLinkOnlyUrl(node: TiptapNode): string | null {
	if (node.type !== "paragraph") return null;
	if (node.content?.length !== 1) return null;
	const child = node.content[0];
	if (child.type !== "text" || !child.text) return null;
	const linkMark = child.marks?.find((m) => m.type === "link");
	if (!linkMark?.attrs?.href) return null;
	if (child.text !== linkMark.attrs.href) return null;
	return linkMark.attrs.href;
}

function flushNodes(nodes: TiptapNode[], segments: PostSegment[]) {
	if (nodes.length === 0) return;
	segments.push({
		type: "html",
		html: generateHTML({ type: "doc", content: nodes }, makeExtensions()),
	});
}

export function renderPostContent(rawJson: string | object): PostSegment[] {
	const doc = typeof rawJson === "string" ? JSON.parse(rawJson) : rawJson;
	const segments: PostSegment[] = [];
	let currentNodes: TiptapNode[] = [];

	for (const node of doc.content ?? []) {
		if (node.type === "codeBlock") {
			flushNodes(currentNodes, segments);
			currentNodes = [];
			segments.push({
				type: "code",
				lang: node.attrs?.language ?? "plaintext",
				code: node.content?.[0]?.text ?? "",
			});
			continue;
		}

		const embedUrl = getLinkOnlyUrl(node);
		if (embedUrl) {
			flushNodes(currentNodes, segments);
			currentNodes = [];
			segments.push({ type: "embed", url: embedUrl });
			continue;
		}

		currentNodes.push(node);
	}

	flushNodes(currentNodes, segments);
	return segments;
}
