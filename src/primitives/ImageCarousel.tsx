/** biome-ignore-all lint/a11y/useKeyWithClickEvents: none */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: none */
"use client";

import { ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
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
import { cn } from "@/lib/client/utils";

interface ImageInterface {
	fileUrl: string;
	fileType: "image" | "gif";
}
interface CarouselControlsProps {
	images: ImageInterface[];
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
					className="absolute left-2 top-1/2 rounded-full z-10 border-none bg-white! text-black! backdrop-blur-sm"
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
					className="absolute right-2 top-1/2 rounded-full z-10 border-none bg-white! text-black! backdrop-blur-sm"
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
							i === current ? "w-4 bg-white" : "w-1.5 bg-white/30"
						)}
						aria-label={`Go to slide ${i + 1}`}
					/>
				))}
			</div>
		</>
	);
}

interface ImageCarouselProps {
	images: ImageInterface[];
	spoiler?: boolean;
	aspectRatio?: number;
}

export function ImageCarousel({
	images,
	spoiler = false,
	aspectRatio = 16 / 9,
}: ImageCarouselProps) {
	const [current, setCurrent] = React.useState(0);
	const [api, setApi] = React.useState<CarouselApi>();

	const [spoilerRevealed, setSpoilerRevealed] = React.useState(!spoiler);
	const showSpoiler = spoiler && !spoilerRevealed;

	React.useEffect(() => {
		if (!api) return;
		const onSelect = () => setCurrent(api.selectedScrollSnap());
		api.on("select", () => {
			setCurrent(api.selectedScrollSnap());
		});

		return () => {
			api.off("select", onSelect);
		};
	}, [api]);

	if (images.length === 0) return null;

	return (
		<div className="w-full group/carousel">
			<AspectRatio
				ratio={aspectRatio}
				className="relative overflow-hidden rounded-lg border bg-muted"
			>
				<Carousel setApi={setApi} className="w-full h-full">
					<CarouselContent className="h-full ml-0">
						{images.map((image, index) => (
							<CarouselItem
								key={image.fileUrl}
								className="relative pl-0 h-full"
							>
								<Image
									src={image.fileUrl}
									alt="Post content"
									width={0}
									height={0}
									sizes="100vw"
									priority={index === 0}
									className="w-full h-full object-cover transition-[filter] duration-300 ease-in-out"
									style={{
										filter: showSpoiler
											? "blur(40px) brightness(0.6) saturate(0.6)"
											: "none",
									}}
									unoptimized={image.fileType === "gif"}
								/>
							</CarouselItem>
						))}
					</CarouselContent>

					{/* ── Spoiler overlay ───────────────────────────────────────────────────── */}
					{showSpoiler && (
						<div
							className="absolute inset-0 z-20 flex items-center justify-center"
							onClick={(e) => {
								e.stopPropagation();
								setSpoilerRevealed(true);
							}}
						>
							<div className="flex flex-col items-center text-white pointer-events-none">
								<div className="backdrop-blur-sm">
									<Eye size={30} strokeWidth={1.5} />
								</div>
								<div className="text-center space-y-0.5">
									<p className="text-sm font-semibold tracking-wide">
										View spoiler
									</p>
								</div>
							</div>
						</div>
					)}

					{/* ── Spoiler re-hide button ────────────────────────────────────────────── */}
					{spoiler && spoilerRevealed && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								setSpoilerRevealed(false);
							}}
							className="absolute top-2 left-2 z-20 text-white p-1.5 rounded-full hover:bg-white/10 transition-colors pointer-events-auto"
							aria-label="Hide spoiler"
						>
							<EyeOff size={20} />
						</button>
					)}

					{/* Only show carousel controls if the spoiler is revealed/inactive */}
					{images.length > 1 && !showSpoiler && (
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
