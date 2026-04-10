"use client";

import type { NodeViewProps } from "@tiptap/core";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

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
