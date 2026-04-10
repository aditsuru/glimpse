"use client";

import { Check, Copy } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

interface CodeBlockRenderedProps {
	/** Detected language string from the `language-*` class on <code> */
	language: string;
	/** Plain text of the code (used for clipboard) */
	codeText: string;
	/** Syntax-highlighted React nodes (produced by domToReact) */
	children: ReactNode;
}

/**
 * CodeBlockRendered
 *
 * Used by RichRenderer's html-react-parser `replace` rule to swap
 * `<pre class="tiptap-code-block">` with this interactive React component.
 * Mirrors the visual structure of CodeBlockView (editor node view) so both
 * surfaces look identical.
 *
 * All visual styles come from globals.css (.tiptap-code-block-wrapper, etc.)
 */
export function CodeBlockRendered({
	language,
	codeText,
	children,
}: CodeBlockRenderedProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(codeText).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	};

	return (
		<div className="tiptap-code-block-wrapper not-prose">
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
				<code>{children}</code>
			</pre>
		</div>
	);
}
