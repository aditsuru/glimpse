/** biome-ignore-all lint/suspicious/noExplicitAny: none */
"use client";

import type { JSONContent } from "@tiptap/core";
import { generateHTML } from "@tiptap/core";
import parse from "html-react-parser";
import { common, createLowlight } from "lowlight";
import { Check, Copy, ExternalLink } from "lucide-react";
import Image from "next/image";
import { createElement, useMemo, useState } from "react";
import useSWR from "swr";
import { MentionHoverCard } from "@/components/editor/MentionHoverCard";
import { cn } from "@/lib/client/utils";
import { baseExtensions, READ_MORE_THRESHOLD } from "./extensions";
import type { RichRendererProps } from "./types";

// ─── LinkPreview ──────────────────────────────────────────────────────────────

interface EmbedMeta {
	title: string | null;
	description: string | null;
	image: string | null;
	siteName: string | null;
	url: string;
}

const fetcher = (u: string): Promise<EmbedMeta> =>
	fetch(`/api/embed?url=${encodeURIComponent(u)}`).then((r) => {
		if (!r.ok) throw new Error("Failed to fetch embed");
		return r.json() as Promise<EmbedMeta>;
	});

function LinkPreviewSkeleton({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"rounded-lg border bg-card overflow-hidden mt-2 animate-pulse",
				className
			)}
		>
			<div className="aspect-video w-full bg-muted-foreground/15" />
			<div className="p-3 space-y-2">
				<div className="h-3 bg-muted-foreground/15 rounded w-1/4" />
				<div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
				<div className="h-3 bg-muted-foreground/15 rounded w-full" />
				<div className="h-3 bg-muted-foreground/10 rounded w-2/3" />
			</div>
		</div>
	);
}

function LinkPreview({ url, className }: { url: string; className?: string }) {
	const { data, isLoading } = useSWR<EmbedMeta>(url, fetcher, {
		revalidateOnFocus: false,
		dedupingInterval: 60_000,
	});

	if (isLoading) return <LinkPreviewSkeleton className={className} />;
	if (!data || "error" in data || !data.title) return null;

	let hostname = url;
	try {
		hostname = new URL(url).hostname;
	} catch {
		// malformed URL — fall back to raw string
	}

	return (
		<a
			href={url}
			target="_blank"
			rel="noopener noreferrer"
			className={cn(
				"group block rounded-lg border bg-card overflow-hidden mt-2",
				"no-underline transition-colors hover:bg-muted/30",
				className
			)}
		>
			{data.image && (
				<div className="relative aspect-video w-full overflow-hidden bg-muted">
					<Image
						src={data.image}
						alt={data.title}
						fill
						sizes="(max-width: 640px) 100vw, 560px"
						className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
						unoptimized
					/>
				</div>
			)}
			<div className="p-3">
				{data.siteName && (
					<p className="text-[11px] font-medium text-muted-foreground mb-1 truncate uppercase tracking-wide">
						{data.siteName}
					</p>
				)}
				<p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
					{data.title}
				</p>
				{data.description && (
					<p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
						{data.description}
					</p>
				)}
				<div className="flex items-center gap-1 mt-2">
					<ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
					<span className="text-[11px] text-muted-foreground truncate">
						{hostname}
					</span>
				</div>
			</div>
		</a>
	);
}

// ─── CodeBlockRendered ────────────────────────────────────────────────────────

const lowlight = createLowlight(common);

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

function CodeBlockRendered({
	language,
	codeText,
	stableKey,
}: {
	language: string;
	codeText: string;
	stableKey: string;
}) {
	const [copied, setCopied] = useState(false);

	const highlighted = useMemo(() => {
		if (!codeText) return null;
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
		<div
			key={stableKey}
			className="tiptap-code-block-wrapper not-prose"
			data-type="codeBlock"
		>
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

// ─── RichRenderer helpers ─────────────────────────────────────────────────────

function extractFirstLink(node: JSONContent): string | null {
	if (node.marks) {
		for (const mark of node.marks) {
			if (mark.type === "link" && typeof mark.attrs?.href === "string") {
				return mark.attrs.href;
			}
		}
	}
	if (node.content) {
		for (const child of node.content) {
			const found = extractFirstLink(child);
			if (found) return found;
		}
	}
	return null;
}

function extractText(nodes: any[]): string {
	return nodes
		.map((node) => {
			if (node.type === "text") return node.data || "";
			if (node.type === "tag" && node.children)
				return extractText(node.children);
			return "";
		})
		.join("");
}

function extractTextLength(node: JSONContent): number {
	let len = 0;
	if (node.text) len += node.text.length;
	if (node.content) {
		for (const child of node.content) len += extractTextLength(child);
	}
	return len;
}

// ─── RichRenderer ─────────────────────────────────────────────────────────────

export function RichRenderer({
	content,
	fetchMentionUser,
	readMore,
}: RichRendererProps) {
	const [expanded, setExpanded] = useState(false);

	const json = content as JSONContent;
	const firstLink = extractFirstLink(json);
	const html = generateHTML(json, baseExtensions);

	const threshold =
		typeof readMore === "number" ? readMore : READ_MORE_THRESHOLD;
	const isLong = !!readMore && extractTextLength(json) > threshold;
	const shouldCollapse = isLong && !expanded;

	let codeBlockIndex = 0;

	const rendered = parse(html, {
		replace(domNode: any) {
			if (domNode.type !== "tag") return;

			if (
				domNode.name === "pre" &&
				(domNode.attribs?.class || "").includes("tiptap-code-block")
			) {
				const codeEl = domNode.children?.find(
					(c: any) => c.type === "tag" && c.name === "code"
				);

				const langMatch = (codeEl?.attribs?.class || "").match(
					/language-(\w+)/
				);
				const language = langMatch?.[1] || "plaintext";
				const codeText = codeEl ? extractText(codeEl.children) : "";
				const stableKey = `code-${codeBlockIndex++}`;

				return (
					<CodeBlockRendered
						key={stableKey}
						stableKey={stableKey}
						language={language}
						codeText={codeText}
					/>
				);
			}

			if (
				domNode.name === "a" &&
				(domNode.attribs?.["data-mention-id"] ||
					(domNode.attribs?.class || "").includes("tiptap-mention"))
			) {
				const mentionId = domNode.attribs["data-mention-id"] || "unknown";
				const raw = domNode.attribs["data-mention-label"];
				const mentionLabel = raw && raw !== "undefined" ? raw : mentionId;

				return (
					<MentionHoverCard
						key={`mention-${mentionId}`}
						id={mentionId}
						label={mentionLabel}
						fetchUser={fetchMentionUser}
					/>
				);
			}
		},
	});

	return (
		<div>
			<div
				className={cn(
					"tiptap-content prose dark:prose-invert max-w-none wrap-break-word overflow-x-hidden",
					"[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2",
					"[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1.5",
					"[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1"
				)}
			>
				<div
					className={cn(
						"relative",
						shouldCollapse && "max-h-24 overflow-hidden"
					)}
				>
					{rendered}
					{shouldCollapse && (
						<div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-background to-transparent" />
					)}
				</div>
				{isLong && (
					<button
						type="button"
						onClick={() => setExpanded(!expanded)}
						className="text-xs text-muted-foreground hover:text-foreground mt-1"
					>
						{expanded ? "Show less" : "Read more"}
					</button>
				)}
			</div>
			{firstLink && <LinkPreview url={firstLink} />}
		</div>
	);
}
