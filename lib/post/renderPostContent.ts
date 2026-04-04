import { generateHTML } from "@tiptap/html";
import { renderExtensions } from "./extensions";

type TiptapNode = {
	type: string;
	attrs?: Record<string, string>;
	content?: TiptapNode[];
	text?: string;
};

export type PostSegment =
	| { type: "html"; html: string }
	| { type: "code"; lang: string; code: string };

export function renderPostContent(rawJson: string | object): PostSegment[] {
	const doc = typeof rawJson === "string" ? JSON.parse(rawJson) : rawJson;
	const segments: PostSegment[] = [];
	let currentNodes: TiptapNode[] = [];

	for (const node of doc.content ?? []) {
		if (node.type === "codeBlock") {
			if (currentNodes.length > 0) {
				segments.push({
					type: "html",
					html: generateHTML(
						{ type: "doc", content: currentNodes },
						renderExtensions
					),
				});
				currentNodes = [];
			}
			segments.push({
				type: "code",
				lang: node.attrs?.language ?? "plaintext",
				code: node.content?.[0]?.text ?? "",
			});
		} else {
			currentNodes.push(node);
		}
	}

	if (currentNodes.length > 0) {
		segments.push({
			type: "html",
			html: generateHTML(
				{ type: "doc", content: currentNodes },
				renderExtensions
			),
		});
	}

	return segments;
}
