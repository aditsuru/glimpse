import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { Heading } from "@tiptap/extension-heading";
import { Link } from "@tiptap/extension-link";
import { Mention } from "@tiptap/extension-mention";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import { buildMentionSuggestion } from "@/components/editor/mention-suggestion";
import type { MentionUser } from "@/primitives/editor/types";
import { CodeBlockView } from "./CodeBlockView";

export const DEFAULT_CHARACTER_LIMIT = 500;
export const AMBER_WARNING_THRESHOLD = 0.85;
export const DEFAULT_PLACEHOLDER = "What's on your mind?";
export const READ_MORE_THRESHOLD = 300;

const lowlight = createLowlight(common);

const starterKitConfig = StarterKit.configure({
	heading: false,
	codeBlock: false,
	link: false,
});

const headingConfig = Heading.configure({ levels: [1, 2, 3] });

const linkConfig = Link.configure({
	openOnClick: false,
	autolink: true,
	linkOnPaste: true,
	HTMLAttributes: {
		class: "tiptap-link",
		rel: "noopener noreferrer",
		target: "_blank",
	},
});

const codeBlockBaseConfig = CodeBlockLowlight.configure({
	lowlight,
	defaultLanguage: "plaintext",
	HTMLAttributes: { class: "tiptap-code-block not-prose" },
});

const codeBlockEditorConfig = CodeBlockLowlight.extend({
	addNodeView() {
		return ReactNodeViewRenderer(CodeBlockView);
	},
}).configure({
	lowlight,
	defaultLanguage: "plaintext",
	HTMLAttributes: { class: "tiptap-code-block not-prose" },
});

// biome-ignore lint/suspicious/noExplicitAny: TipTap renderHTML typing is opaque
function mentionRenderHTML({ options, node }: { options: any; node: any }) {
	const id = (node.attrs.id as string) ?? "";
	const label = (node.attrs.label as string | undefined) ?? id;
	const char = options?.suggestion?.char ?? "@";

	return [
		"a",
		{
			...options.HTMLAttributes,
			href: `/u/${id}`,
			"data-mention-id": id,
			"data-mention-label": label,
		},
		`${char}${label}`,
	];
}

export const mentionBaseConfig = Mention.configure({
	HTMLAttributes: { class: "tiptap-mention" },
	// biome-ignore lint/suspicious/noExplicitAny: see mentionRenderHTML
	renderHTML: mentionRenderHTML as any,
});

export const baseExtensions = [
	starterKitConfig,
	headingConfig,
	codeBlockBaseConfig,
	linkConfig,
	mentionBaseConfig,
];

export function buildEditorExtensions(
	fetchUsers: (query: string) => Promise<MentionUser[]>,
	placeholder = DEFAULT_PLACEHOLDER,
	maxChars = DEFAULT_CHARACTER_LIMIT
) {
	return [
		starterKitConfig,
		headingConfig,
		codeBlockEditorConfig,
		linkConfig,

		Mention.configure({
			HTMLAttributes: { class: "tiptap-mention" },
			// biome-ignore lint/suspicious/noExplicitAny: see mentionRenderHTML
			renderHTML: mentionRenderHTML as any,
			suggestion: buildMentionSuggestion(fetchUsers),
		}),

		Placeholder.configure({
			placeholder,
			showOnlyWhenEditable: true,
		}),

		CharacterCount.configure({ limit: maxChars }),
	];
}
