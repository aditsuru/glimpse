/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: none */
"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { renderPostContent } from "@/lib/post/renderPostContent";
import { Button } from "../ui/button";

function CodeBlock({ lang, code }: { lang: string; code: string }) {
	const [copied, setCopied] = useState(false);

	const copy = async () => {
		await navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="relative my-2 rounded-md overflow-hidden">
			<Button
				variant="ghost"
				size="icon"
				onClick={copy}
				className="absolute top-2 right-2 z-10 h-7 w-7 text-muted-foreground hover:text-foreground"
			>
				{copied ? <Check size={14} /> : <Copy size={14} />}
			</Button>
			<SyntaxHighlighter
				language={lang}
				style={oneDark}
				showLineNumbers
				customStyle={{
					margin: 0,
					borderRadius: "0.375rem",
					fontSize: "0.8125rem",
				}}
			>
				{code}
			</SyntaxHighlighter>
		</div>
	);
}

export function PostBody({ content }: { content: string | object }) {
	const segments = renderPostContent(content);

	return (
		<div className="post-body">
			{segments.map((segment) =>
				segment.type === "html" ? (
					<div
						key={crypto.randomUUID()}
						dangerouslySetInnerHTML={{ __html: segment.html }}
					/>
				) : (
					<CodeBlock
						key={crypto.randomUUID()}
						lang={segment.lang}
						code={segment.code}
					/>
				)
			)}
		</div>
	);
}
