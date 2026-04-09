/**
 * extensions.ts
 *
 * Two export surfaces:
 *  - `baseExtensions`         → server-safe, used by RichRenderer / generateHTML
 *  - `buildEditorExtensions`  → client-only, used by RichEditor (adds node views)
 */

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

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

export const CHARACTER_LIMIT = 500;

const lowlight = createLowlight(common);

// ─────────────────────────────────────────────
// StarterKit
//
// FIX: Tiptap v3 bundles Link inside StarterKit by default.
// Duplicate extension names → "Duplicate extension names found: ['link']" warning.
// Disable it so our custom linkConfig is the only Link extension.
// ─────────────────────────────────────────────

const starterKitConfig = StarterKit.configure({
	heading: false, // added separately with levels config
	codeBlock: false, // added separately with lowlight + node view
	link: false, // v3 includes Link in StarterKit; we use our own below
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

// ─────────────────────────────────────────────
// Code block — two variants
// ─────────────────────────────────────────────

/** Server-safe: no React node view. Used in baseExtensions → generateHTML. */
const codeBlockBaseConfig = CodeBlockLowlight.configure({
	lowlight,
	defaultLanguage: "plaintext",
	HTMLAttributes: { class: "tiptap-code-block not-prose" },
});

/**
 * Editor variant: extends CodeBlockLowlight with a React node view that adds
 * a copy button and a language label bar. Client-only.
 *
 * Syntax colours require a highlight.js CSS theme. Add ONE of these to layout.tsx:
 *   import "highlight.js/styles/github-dark.css"   // dark
 *   import "highlight.js/styles/github.css"         // light
 * highlight.js is already a transitive dep of lowlight — no extra install needed.
 */
const codeBlockEditorConfig = CodeBlockLowlight.extend({
	addNodeView() {
		return ReactNodeViewRenderer(CodeBlockView);
	},
}).configure({
	lowlight,
	defaultLanguage: "plaintext",
	HTMLAttributes: { class: "tiptap-code-block not-prose" },
});

// ─────────────────────────────────────────────
// Mention render helper
//
// FIX: "undefinedaditsuru" bug root cause:
//
// In baseExtensions, Mention is used without a `suggestion` config.
// For generateHTML (SSR), the Suggestion ProseMirror plugin never
// initialises — so options.suggestion is a raw partial object whose
// .char may be undefined. Doing `options.suggestion.char` gives undefined,
// and `undefined + "aditsuru"` → the literal string "undefinedaditsuru".
//
// Fix: options.suggestion?.char ?? "@"
// Also guard node.attrs.label which can be undefined if the node was
// inserted before the label attribute was populated.
// ─────────────────────────────────────────────

// biome-ignore lint/suspicious/noExplicitAny: TipTap renderHTML typing is complex
function mentionRenderHTML({ options, node }: { options: any; node: any }) {
	const id = (node.attrs.id as string) ?? "";
	const label = (node.attrs.label as string | undefined) ?? id; // guard undefined label
	const char = options.suggestion?.char ?? "@"; // guard SSR context

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

// ─────────────────────────────────────────────
// baseExtensions — server-safe, no node views, no suggestion plugin
// Used by RichRenderer → generateHTML
// ─────────────────────────────────────────────

export const mentionBaseConfig = Mention.configure({
	HTMLAttributes: { class: "tiptap-mention" },
	// biome-ignore lint/suspicious/noExplicitAny: see mentionRenderHTML above
	renderHTML: mentionRenderHTML as any,
});

export const baseExtensions = [
	starterKitConfig,
	headingConfig,
	codeBlockBaseConfig,
	linkConfig,
	mentionBaseConfig,
];

// ─────────────────────────────────────────────
// buildEditorExtensions — CLIENT-ONLY
// Adds: mention suggestion, placeholder, character count, node views
// ─────────────────────────────────────────────

export function buildEditorExtensions(
	fetchUsers: (query: string) => Promise<MentionUser[]>,
	placeholder = "What's on your mind?"
) {
	return [
		starterKitConfig,
		headingConfig,
		codeBlockEditorConfig, // ← with copy button + language header
		linkConfig,

		Mention.configure({
			HTMLAttributes: { class: "tiptap-mention" },
			// biome-ignore lint/suspicious/noExplicitAny: see mentionRenderHTML above
			renderHTML: mentionRenderHTML as any,
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
