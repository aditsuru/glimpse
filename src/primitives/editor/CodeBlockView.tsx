"use client";

import type { NodeViewProps } from "@tiptap/core";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

/**
 * CodeBlockView
 *
 * React node view for CodeBlockLowlight. Replaces the plain <pre> with:
 *  - A header bar showing the detected language + a copy button
 *  - A scrollable <pre> whose scrollbar is hidden (still scrollable via touch/mouse)
 *
 * Syntax colours: add ONE of these imports to your layout.tsx or globals.css:
 *   import "highlight.js/styles/github-dark.css"   // dark theme
 *   import "highlight.js/styles/github.css"         // light theme
 *   import "highlight.js/styles/atom-one-dark.css"  // popular dark
 *
 * highlight.js is already a transitive dep of lowlight, so no extra install needed.
 */
export function CodeBlockView({ node }: NodeViewProps) {
	const [copied, setCopied] = useState(false);

	const language = (node.attrs.language as string | null) || "plaintext";

	const handleCopy = () => {
		// node.textContent strips the tags — gives us raw code
		navigator.clipboard.writeText(node.textContent).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	};

	return (
		<NodeViewWrapper
			// contentEditable={false} is set automatically by TipTap on NodeViewWrapper
			className="my-4 rounded-md border border-border overflow-hidden not-prose"
			data-type="codeBlock"
		>
			{/* ── Header bar ── */}
			<div className="flex items-center justify-between bg-muted/60 border-b border-border px-3 py-1.5">
				<span className="text-[11px] font-mono text-muted-foreground select-none">
					{language}
				</span>

				<button
					type="button"
					onClick={handleCopy}
					className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors select-none"
					aria-label="Copy code"
				>
					{copied ? (
						<Check className="h-3 w-3 text-green-500" />
					) : (
						<Copy className="h-3 w-3" />
					)}
					{copied ? "Copied!" : "Copy"}
				</button>
			</div>

			{/* ── Code body ── */}
			{/*
			 * overflow-x-auto lets long lines scroll horizontally.
			 * The three scrollbar-hiding rules are required for full cross-browser coverage:
			 *   [scrollbar-width:none]          → Firefox
			 *   [-ms-overflow-style:none]       → IE/Edge legacy
			 *   [&::-webkit-scrollbar]:hidden   → Chrome/Safari/new Edge
			 */}
			<pre
				className={[
					"tiptap-code-block", // your existing prose-reset class
					"overflow-x-auto",
					"[scrollbar-width:none]",
					"[-ms-overflow-style:none]",
					"[&::-webkit-scrollbar]:hidden",
					"px-4 py-3 m-0 text-sm leading-relaxed",
					"bg-[#1e1e1e] dark:bg-[#1e1e1e]", // neutral dark bg that suits any hljs theme
				].join(" ")}
			>
				<NodeViewContent as="div" />
			</pre>
		</NodeViewWrapper>
	);
}
