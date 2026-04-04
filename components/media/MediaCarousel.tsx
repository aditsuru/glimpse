"use client";

import Image from "next/image";
import * as React from "react";
import { VideoPlayer } from "@/components/media/VIdeoPlayer";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
	Carousel,
	type CarouselApi,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import type { AttachmentType } from "@/lib/constants";
import { Button } from "../ui/button";

interface Attachment {
	fileUrl: string;
	fileType: AttachmentType;
}

interface MediaCarouselProps {
	attachments: Attachment[];
}

function MediaItem({ attachment }: { attachment: Attachment }) {
	if (attachment.fileType === "video") {
		return <VideoPlayer src={attachment.fileUrl} />;
	}

	return (
		<Image
			src={attachment.fileUrl}
			alt="Post attachment"
			fill
			priority
			className="rounded-lg object-cover"
			sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
		/>
	);
}

export function MediaCarousel({ attachments }: MediaCarouselProps) {
	const [api, setApi] = React.useState<CarouselApi>();
	const [current, setCurrent] = React.useState(0);
	const [count, setCount] = React.useState(0);

	React.useEffect(() => {
		if (!api) return;

		setCount(api.scrollSnapList().length);
		setCurrent(api.selectedScrollSnap());

		api.on("select", () => {
			setCurrent(api.selectedScrollSnap());
		});
	}, [api]);

	if (!attachments || attachments.length === 0) return null;

	if (attachments.length === 1) {
		return (
			<AspectRatio
				ratio={16 / 9}
				className="rounded-lg bg-muted border overflow-hidden"
			>
				<MediaItem attachment={attachments[0]} />
			</AspectRatio>
		);
	}

	return (
		<div className="w-full group/carousel">
			<Carousel setApi={setApi} className="w-full">
				<CarouselContent>
					{attachments.map((attachment) => (
						<CarouselItem key={attachment.fileUrl}>
							<AspectRatio
								ratio={16 / 9}
								className="rounded-lg bg-muted border overflow-hidden"
							>
								<MediaItem attachment={attachment} />
							</AspectRatio>
						</CarouselItem>
					))}
				</CarouselContent>

				{/* Hidden by default, appear on hover for cleaner UX */}
				<CarouselPrevious className="left-2 opacity-0 group-hover/carousel:opacity-100 transition-opacity bg-black/50 hover:bg-black/80 border-none text-white" />
				<CarouselNext className="right-2 opacity-0 group-hover/carousel:opacity-100 transition-opacity bg-black/50 hover:bg-black/80 border-none text-white" />
			</Carousel>

			{/* Pagination Dots */}
			{attachments.length > 1 && (
				<div className="mt-3 flex justify-center gap-1.5">
					{attachments.map((attachment, i) => (
						<Button
							key={attachment.fileUrl}
							onClick={() => api?.scrollTo(i)}
							aria-label={`Go to slide ${i + 1}`}
							className={`h-1.5 rounded-full transition-all duration-300 ${
								i === current
									? "w-4 bg-primary"
									: "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
							}`}
						/>
					))}
				</div>
			)}
		</div>
	);
}
