"use client";

import { Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
	type PostSegment,
	renderPostContent,
} from "@/lib/post/renderPostContent";
import { UrlEmbed } from "../media/UrlEmbed";
import { Button } from "../ui/button";

const CHAR_LIMIT = 600;

function stableKey(segment: PostSegment): string {
	switch (segment.type) {
		case "code":
			return `code-${segment.lang}-${segment.code.length}-${segment.code.slice(0, 24)}`;
		case "embed":
			return `embed-${segment.url}`;
		case "html":
			return `html-${segment.html.length}-${segment.html.slice(0, 24)}`;
	}
}

function visibleTextLength(segment: PostSegment): number {
	switch (segment.type) {
		case "code":
			return segment.code.length;
		case "embed":
			return 0;
		case "html":
			return segment.html.replace(/<[^>]*>/g, "").length;
	}
}

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
	const segments = useMemo(() => renderPostContent(content), [content]);
	const [expanded, setExpanded] = useState(false);

	const { visibleSegments, needsReadMore } = useMemo(() => {
		let chars = 0;
		let cutoff = segments.length;

		for (let i = 0; i < segments.length; i++) {
			// Check BEFORE accumulating — if already over limit, cut here
			if (chars > CHAR_LIMIT) {
				cutoff = i;
				break;
			}
			chars += visibleTextLength(segments[i]);
		}

		return {
			visibleSegments: expanded ? segments : segments.slice(0, cutoff),
			needsReadMore: cutoff < segments.length,
		};
	}, [segments, expanded]);

	return (
		<div className="post-body">
			{visibleSegments.map((segment) => {
				switch (segment.type) {
					case "html":
						return (
							<div
								key={stableKey(segment)}
								// biome-ignore lint/security/noDangerouslySetInnerHtml: tiptap-generated HTML
								dangerouslySetInnerHTML={{ __html: segment.html }}
							/>
						);
					case "code":
						return (
							<CodeBlock
								key={stableKey(segment)}
								lang={segment.lang}
								code={segment.code}
							/>
						);
					case "embed":
						return <UrlEmbed key={stableKey(segment)} url={segment.url} />;
					default:
						return null;
				}
			})}

			{needsReadMore && (
				<button
					type="button"
					onClick={() => setExpanded((e) => !e)}
					className="text-sm text-primary hover:underline mt-1 block"
				>
					{expanded ? "Show less" : "Read more"}
				</button>
			)}
		</div>
	);
}
