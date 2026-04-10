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

export const CHARACTER_LIMIT = 500;

const lowlight = createLowlight(common);

// ─────────────────────────────────────────────
// StarterKit
//
// FIX: Tiptap v3 bundles Link inside StarterKit by default.
// Adding Link separately → "Duplicate extension names found: ['link']".
// Disable the bundled one so our custom linkConfig is the only instance.
// ─────────────────────────────────────────────

const starterKitConfig = StarterKit.configure({
	heading: false, // added separately with levels config
	codeBlock: false, // added separately with lowlight + React node view
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

/** Server-safe: no React node view. Used by baseExtensions → generateHTML (SSR). */
const codeBlockBaseConfig = CodeBlockLowlight.configure({
	lowlight,
	defaultLanguage: "plaintext",
	// Note: these HTMLAttributes end up on the <pre> emitted by generateHTML.
	// RichRenderer replaces that <pre> via html-react-parser, so the class is
	// used as a selector for the replace rule, not for visual styling.
	HTMLAttributes: { class: "tiptap-code-block not-prose" },
});

/**
 * Editor variant: extends CodeBlockLowlight with the React node view that
 * renders the copy button + language label. CLIENT-ONLY.
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
// Mention renderHTML — shared between editor and base (SSR)
//
// ROOT BUG FIX: "@undefinedaditsuru"
//
// In baseExtensions (used by generateHTML / SSR), Mention is configured
// WITHOUT a suggestion plugin. In that context, options.suggestion may be a
// partial object whose `.char` property is undefined. Concatenating:
//   undefined + "aditsuru" → "undefinedaditsuru"
//
// Fix: options.suggestion?.char ?? "@"
// Also guard node.attrs.label which can be undefined for legacy stored content.
// ─────────────────────────────────────────────

// biome-ignore lint/suspicious/noExplicitAny: TipTap renderHTML typing is opaque
function mentionRenderHTML({ options, node }: { options: any; node: any }) {
	const id = (node.attrs.id as string) ?? "";
	const label = (node.attrs.label as string | undefined) ?? id; // guard undefined
	const char = options?.suggestion?.char ?? "@"; // guard SSR context

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
// baseExtensions — SERVER-SAFE
// No node views, no suggestion plugin, no DOM dependency.
// Used by RichRenderer → generateHTML.
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// buildEditorExtensions — CLIENT-ONLY
// Adds: code block node view, mention suggestion, placeholder, char count.
// ─────────────────────────────────────────────

export function buildEditorExtensions(
	fetchUsers: (query: string) => Promise<MentionUser[]>,
	placeholder = "What's on your mind?"
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

		CharacterCount.configure({
			limit: CHARACTER_LIMIT,
		}),
	];
}
