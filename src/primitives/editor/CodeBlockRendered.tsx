"use client";

import { common, createLowlight } from "lowlight";
import { Check, Copy } from "lucide-react";
import { createElement, useMemo, useState } from "react";

/*
 * WHY this component runs lowlight itself:
 *
 * generateHTML() from @tiptap/core serializes TipTap JSON → HTML by calling
 * each node's renderHTML() method. CodeBlockLowlight's renderHTML() only emits
 * the <pre><code> shell — it does NOT apply syntax highlighting.
 *
 * Syntax highlighting in the editor is applied by a ProseMirror *decoration*
 * plugin at runtime. Decorations are ephemeral (not stored in the document JSON).
 * So the JSON → generateHTML pipeline always produces plain-text code blocks.
 *
 * RichRenderer passes the raw text as `codeText`. We run lowlight here on the
 * client to produce highlighted spans, matching what the editor shows.
 */

const lowlight = createLowlight(common);

// ─── hast → React ────────────────────────────────────────────────────────────
// lowlight returns a hast (Hypertext Abstract Syntax Tree). We convert it to
// React elements without extra packages by recursing over the tree.
// biome-ignore lint/suspicious/noExplicitAny: hast node shape
function hastToReact(nodes: any[], keyPrefix = ""): React.ReactNode {
	return nodes.map((node: any, i: number) => {
		const key = `${keyPrefix}${i}`;

		if (node.type === "text") return node.value as string;

		if (node.type === "element") {
			const className = Array.isArray(node.properties?.className)
				? (node.properties.className as string[]).join(" ")
				: undefined;

			return createElement(
				"span",
				{ key, className },
				hastToReact(node.children ?? [], `${key}-`)
			);
		}

		return null;
	});
}

// ─── Component ───────────────────────────────────────────────────────────────

interface CodeBlockRenderedProps {
	/** Language detected from the `language-*` class on the <code> element */
	language: string;
	/** Raw plain-text code extracted from the <code> element */
	codeText: string;
}

export function CodeBlockRendered({
	language,
	codeText,
}: CodeBlockRenderedProps) {
	const [copied, setCopied] = useState(false);

	const highlighted = useMemo(() => {
		if (!codeText) return null;
		// FIX: Bypass lowlight for plaintext to avoid internal throw errors
		if (!language || language === "plaintext") return codeText;

		try {
			const result = lowlight.highlight(language, codeText);
			return hastToReact(result.children);
		} catch {
			return codeText;
		}
	}, [language, codeText]);

	const handleCopy = () => {
		navigator.clipboard.writeText(codeText).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	};

	return (
		// FIX: Added data-type="codeBlock" to perfectly match the editor DOM
		<div className="tiptap-code-block-wrapper not-prose" data-type="codeBlock">
			<div className="tiptap-code-header">
				<span className="tiptap-code-language">{language || "plaintext"}</span>
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
				{/* FIX: Added the dynamic language class to the code element */}
				<code
					className={
						language && language !== "plaintext"
							? `language-${language}`
							: undefined
					}
				>
					{highlighted}
				</code>
			</pre>
		</div>
	);
}
