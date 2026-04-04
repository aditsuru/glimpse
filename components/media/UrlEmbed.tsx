"use client";

import { ExternalLink } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface OgData {
	title: string | null;
	description: string | null;
	image: string | null;
	siteName: string | null;
	url: string;
}

interface UrlEmbedProps {
	url: string;
}

export function UrlEmbed({ url }: UrlEmbedProps) {
	const [data, setData] = useState<OgData | null>(null);
	const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

	useEffect(() => {
		fetch(`/api/og?url=${encodeURIComponent(url)}`)
			.then((r) => r.json())
			.then((d: OgData & { error?: string }) => {
				if (d.error || (!d.title && !d.image)) {
					setState("failed");
				} else {
					setData(d);
					setState("ready");
				}
			})
			.catch(() => setState("failed"));
	}, [url]);

	// Failed or no OG data — fall back to a plain link, never nothing
	if (state === "failed") {
		return (
			<a
				href={url}
				target="_blank"
				rel="noopener noreferrer"
				className="text-sm text-primary underline underline-offset-4 break-all"
			>
				{url}
			</a>
		);
	}

	if (state === "loading") {
		return <Card className="my-2 h-20 animate-pulse bg-muted border" />;
	}

	if (!data) return null;

	return (
		<a
			href={url}
			target="_blank"
			rel="noopener noreferrer"
			className="block my-2 no-underline"
		>
			<Card className="overflow-hidden hover:bg-muted/50 transition-colors">
				{data.image && (
					<div className="relative w-full h-40">
						<Image
							src={data.image}
							alt={data.title ?? ""}
							fill
							className="object-cover"
							unoptimized // OG images are external — skip Next.js optimization
						/>
					</div>
				)}
				<div className="p-3 flex flex-col gap-1">
					{data.siteName && (
						<span className="text-xs text-muted-foreground flex items-center gap-1">
							<ExternalLink size={10} />
							{data.siteName}
						</span>
					)}
					{data.title && (
						<span className="text-sm font-medium leading-snug line-clamp-2">
							{data.title}
						</span>
					)}
					{data.description && (
						<span className="text-xs text-muted-foreground line-clamp-2">
							{data.description}
						</span>
					)}
				</div>
			</Card>
		</a>
	);
}
