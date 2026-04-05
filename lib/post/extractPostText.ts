type TiptapNode = {
	type: string;
	text?: string;
	content?: TiptapNode[];
	attrs?: Record<string, string>;
};

function walkNodes(nodes: TiptapNode[]): string {
	return nodes
		.map((node) => {
			if (node.type === "text") return node.text ?? "";
			if (node.type === "mention") return `@${node.attrs?.label ?? ""}`;
			if (node.type === "hardBreak") return " ";
			if (node.content) return walkNodes(node.content);
			return "";
		})
		.join("");
}

export function extractPostText(rawJson: string | object): string {
	try {
		const doc = typeof rawJson === "string" ? JSON.parse(rawJson) : rawJson;
		return walkNodes(doc.content ?? []).trim();
	} catch {
		return "";
	}
}
