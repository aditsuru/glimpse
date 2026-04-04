"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import {
	Carousel,
	type CarouselApi,
	CarouselContent,
	CarouselItem,
	useCarousel,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import type { AttachmentWithoutKey } from "@/server/shared/schemas/post";

interface CarouselControlsProps {
	images: AttachmentWithoutKey[];
	current: number;
	scrollTo: (index: number) => void;
}

function CarouselControls({
	images,
	current,
	scrollTo,
}: CarouselControlsProps) {
	const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } =
		useCarousel();

	return (
		<>
			{/* Navigation Buttons */}
			{canScrollPrev && (
				<Button
					variant="outline"
					size="icon"
					className="absolute left-2 top-1/2 rounded-full z-10 border-none bg-background/50 backdrop-blur-md"
					onClick={(e) => {
						e.stopPropagation();
						scrollPrev();
					}}
				>
					<ChevronLeft className="size-5" />
					<span className="sr-only">Previous image</span>
				</Button>
			)}
			{canScrollNext && (
				<Button
					variant="outline"
					size="icon"
					className="absolute right-2 top-1/2 rounded-full z-10 border-none bg-background/50 backdrop-blur-md"
					onClick={(e) => {
						e.stopPropagation();
						scrollNext();
					}}
				>
					<ChevronRight className="size-5" />
					<span className="sr-only">Next image</span>
				</Button>
			)}

			{/* Pagination Dots - Inside Aspect Ratio */}
			<div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
				{images.map((image, i) => (
					<button
						type="button"
						key={image.fileUrl}
						onClick={(e) => {
							e.stopPropagation();
							scrollTo(i);
						}}
						className={cn(
							"h-1.5 rounded-full transition-all duration-300 shadow-xs",
							i === current ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
						)}
						aria-label={`Go to slide ${i + 1}`}
					/>
				))}
			</div>
		</>
	);
}

interface ImageCarouselProps {
	attachments: AttachmentWithoutKey[];
}

export function ImageCarousel({ attachments }: ImageCarouselProps) {
	const [current, setCurrent] = React.useState(0);
	const [api, setApi] = React.useState<CarouselApi>();

	const images = React.useMemo(
		() =>
			attachments.filter((a) => a.fileType === "image" || a.fileType === "gif"),
		[attachments]
	);

	React.useEffect(() => {
		if (!api) return;
		setCurrent(api.selectedScrollSnap());
		api.on("select", () => {
			setCurrent(api.selectedScrollSnap());
		});
	}, [api]);

	if (images.length === 0) return null;

	return (
		<div className="w-full group/carousel">
			<AspectRatio
				ratio={16 / 9}
				className="relative overflow-hidden rounded-lg border bg-muted"
			>
				<Carousel setApi={setApi} className="w-full h-full">
					<CarouselContent className="h-full ml-0">
						{images.map((image, index) => (
							<CarouselItem key={image.fileUrl} className="pl-0 h-full">
								<Image
									src={image.fileUrl}
									alt="Post content"
									width={1280}
									height={720}
									priority={index === 0}
									className="w-full h-full object-cover"
								/>
							</CarouselItem>
						))}
					</CarouselContent>

					{images.length > 1 && (
						<CarouselControls
							images={images}
							current={current}
							scrollTo={(index) => api?.scrollTo(index)}
						/>
					)}
				</Carousel>
			</AspectRatio>
		</div>
	);
}
