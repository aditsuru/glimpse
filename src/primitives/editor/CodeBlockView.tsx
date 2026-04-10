"use client";

import type { NodeViewProps } from "@tiptap/core";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

/**
 * CodeBlockView — TipTap React node view for the editor.
 *
 * All visual styles are driven by globals.css (.tiptap-code-block-wrapper,
 * .tiptap-code-header, etc.) so you can tweak colors, spacing, and fonts
 * from one place.
 *
 * For syntax highlighting colours, add ONE of these imports to layout.tsx:
 *   import "highlight.js/styles/github-dark.css"
 *   import "highlight.js/styles/atom-one-dark.css"
 * highlight.js is a transitive dep of lowlight — no extra install needed.
 * OR define your own .hljs-* token rules in globals.css (Catppuccin palette
 * is already there).
 */
export function CodeBlockView({ node }: NodeViewProps) {
	const [copied, setCopied] = useState(false);

	const language = (node.attrs.language as string | null) || "plaintext";

	const handleCopy = () => {
		navigator.clipboard.writeText(node.textContent).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	};

	return (
		<NodeViewWrapper
			className="tiptap-code-block-wrapper not-prose"
			data-type="codeBlock"
		>
			<div className="tiptap-code-header">
				<span className="tiptap-code-language">{language}</span>
				<button
					type="button"
					onClick={handleCopy}
					className="tiptap-copy-btn"
					aria-label="Copy code"
				>
					{copied ? (
						<Check className="h-3 w-3 text-green-400" />
					) : (
						<Copy className="h-3 w-3" />
					)}
					<span>{copied ? "Copied!" : "Copy"}</span>
				</button>
			</div>
			<pre className="tiptap-code-block-pre">
				<NodeViewContent as="code" />
			</pre>
		</NodeViewWrapper>
	);
}
