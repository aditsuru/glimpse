import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { Heading } from "@tiptap/extension-heading";
import { Link } from "@tiptap/extension-link";
import { Mention } from "@tiptap/extension-mention";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { StarterKit } from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import { buildMentionSuggestion } from "@/components/editor/mention-suggestion";
import type { MentionUser } from "@/primitives/editor/types";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

export const CHARACTER_LIMIT = 500;

/** Shared lowlight instance with common language support */
const lowlight = createLowlight(common);

// ─────────────────────────────────────────────
// Shared configs (reused in both base and editor sets)
// ─────────────────────────────────────────────

const starterKitConfig = StarterKit.configure({
	// Disabled because we add these separately with custom config
	heading: false,
	codeBlock: false,
});

const headingConfig = Heading.configure({
	levels: [1, 2, 3],
});

const codeBlockConfig = CodeBlockLowlight.configure({
	lowlight,
	defaultLanguage: "plaintext",
	HTMLAttributes: {
		class: "tiptap-code-block not-prose",
	},
});

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

// ─────────────────────────────────────────────
// mentionBaseConfig — shared between editor and renderer.
// No suggestion here — suggestion requires a browser/DOM.
// Safe for server-side generateHTML / static-renderer.
// ─────────────────────────────────────────────

export const mentionBaseConfig = Mention.configure({
	HTMLAttributes: {
		class: "tiptap-mention",
	},
	renderHTML({ options, node }) {
		const id = node.attrs.id as string;
		const label = node.attrs.label as string;

		return [
			"a",
			{
				...options.HTMLAttributes,
				href: `/u/${id}`,
				"data-mention-id": id,
				"data-mention-label": label,
			},
			`${options.suggestion.char}${label}`,
		];
	},
});

// ─────────────────────────────────────────────
// baseExtensions — used ONLY by the static renderer / generateHTML.
// No suggestion, placeholder, or character count.
// ─────────────────────────────────────────────

export const baseExtensions = [
	starterKitConfig,
	headingConfig,
	codeBlockConfig,
	linkConfig,
	mentionBaseConfig,
];

// ─────────────────────────────────────────────
// buildEditorExtensions — client-only.
// Adds mention suggestion, placeholder, character count.
// ─────────────────────────────────────────────

export function buildEditorExtensions(
	fetchUsers: (query: string) => Promise<MentionUser[]>,
	placeholder = "What's on your mind?"
) {
	return [
		starterKitConfig,
		headingConfig,
		codeBlockConfig,
		linkConfig,

		// ✅ Mention WITH suggestion — only here, never in baseExtensions
		Mention.configure({
			HTMLAttributes: { class: "tiptap-mention" },
			renderHTML({ options, node }) {
				const id = node.attrs.id as string;
				const label = node.attrs.label as string;

				return [
					"a",
					{
						...options.HTMLAttributes,
						href: `/u/${id}`,
						"data-mention-id": id,
						"data-mention-label": label,
					},
					`${options.suggestion.char}${label}`,
				];
			},
			suggestion: buildMentionSuggestion(fetchUsers),
		}),

		Placeholder.configure({
			placeholder,
			showOnlyWhenEditable: true,
		}),

		CharacterCount.configure({
			limit: CHARACTER_LIMIT,
		}),
	];
}
