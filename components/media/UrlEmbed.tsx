"use client";

import { ExternalLink } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "../ui/aspect-ratio";

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

	// Reserve height immediately so the feed doesn't reflow when data loads.
	// min-h matches roughly the tallest the card can be (image + text).
	return (
		<div className="my-3 flex flex-col justify-start">
			{state === "failed" && (
				<a
					href={url}
					target="_blank"
					rel="noopener noreferrer"
					className="text-sm text-primary underline underline-offset-4 break-all"
				>
					{url}
				</a>
			)}

			{state === "loading" && (
				<Card className="w-full animate-pulse bg-muted border overflow-hidden">
					<AspectRatio ratio={1.91 / 1} className="bg-muted-foreground/10" />
					<div className="p-3 flex flex-col gap-2">
						<div className="p-3 flex flex-col gap-2">
							<div className="h-3 w-1/4 rounded bg-muted-foreground/10" />
							<div className="h-4 w-3/4 rounded bg-muted-foreground/10" />
							<div className="h-3 w-2/3 rounded bg-muted-foreground/10" />
						</div>
					</div>
				</Card>
			)}

			{state === "ready" && data && (
				<a
					href={url}
					target="_blank"
					rel="noopener noreferrer"
					className="block no-underline"
				>
					<Card className="overflow-hidden hover:bg-muted/50 transition-colors">
						{data.image && (
							<AspectRatio ratio={1.91 / 1}>
								<Image
									src={data.image}
									alt={data.title ?? ""}
									fill
									loading="eager"
									className="object-cover"
									unoptimized
								/>
							</AspectRatio>
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
			)}
		</div>
	);
}
