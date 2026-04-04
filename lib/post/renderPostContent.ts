import { generateHTML } from "@tiptap/html";
import { renderExtensions } from "./extensions";

export function renderPostContent(rawJson: string | object) {
	const doc = typeof rawJson === "string" ? JSON.parse(rawJson) : rawJson;
	return generateHTML(doc, renderExtensions);
}
