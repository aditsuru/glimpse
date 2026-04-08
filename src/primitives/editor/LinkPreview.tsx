"use client";

import { ExternalLink } from "lucide-react";
import Image from "next/image";
import useSWR from "swr";
import { cn } from "@/lib/client/utils";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface EmbedMeta {
	title: string | null;
	description: string | null;
	image: string | null;
	siteName: string | null;
	url: string;
}

interface LinkPreviewProps {
	url: string;
	className?: string;
}

// ─────────────────────────────────────────────
// SWR fetcher
// ─────────────────────────────────────────────

const fetcher = (u: string): Promise<EmbedMeta> =>
	fetch(`/api/embed?url=${encodeURIComponent(u)}`).then((r) => {
		if (!r.ok) throw new Error("Failed to fetch embed");
		return r.json() as Promise<EmbedMeta>;
	});

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────

function LinkPreviewSkeleton({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"rounded-lg border bg-card overflow-hidden mt-2 animate-pulse",
				className
			)}
		>
			{/* Image placeholder — matches aspect-video ratio */}
			<div className="aspect-video w-full bg-muted-foreground/15" />

			{/* Text content placeholder */}
			<div className="p-3 space-y-2">
				<div className="h-3 bg-muted-foreground/15 rounded w-1/4" />
				<div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
				<div className="h-3 bg-muted-foreground/15 rounded w-full" />
				<div className="h-3 bg-muted-foreground/10 rounded w-2/3" />
			</div>
		</div>
	);
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export function LinkPreview({ url, className }: LinkPreviewProps) {
	const { data, isLoading } = useSWR<EmbedMeta>(url, fetcher, {
		revalidateOnFocus: false,
		dedupingInterval: 60_000,
	});

	if (isLoading) return <LinkPreviewSkeleton className={className} />;

	// Fail silently — no title or fetch error → render nothing
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
			{/* ── Aspect-ratio image (16:9) with zoom-on-hover ── */}
			{data.image && (
				<div className="relative aspect-video w-full overflow-hidden bg-muted">
					<Image
						src={data.image}
						alt={data.title}
						fill
						sizes="(max-width: 640px) 100vw, 560px"
						className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
						unoptimized // external origin — swap for your own proxy if needed
					/>
				</div>
			)}

			{/* ── Text content below the image ── */}
			<div className="p-3">
				{/* Site name */}
				{data.siteName && (
					<p className="text-[11px] font-medium text-muted-foreground mb-1 truncate uppercase tracking-wide">
						{data.siteName}
					</p>
				)}

				{/* Title */}
				<p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
					{data.title}
				</p>

				{/* Description */}
				{data.description && (
					<p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
						{data.description}
					</p>
				)}

				{/* URL row */}
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
