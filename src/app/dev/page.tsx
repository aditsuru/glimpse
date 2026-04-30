"use client";

import { toast } from "sonner";
import { type CarouselImage, ImageCarousel } from "@/components/ImageCarousel";
import { Button } from "@/components/ui/button";
import { ScrollContainer, VideoPlayer } from "@/components/VideoPlayer";

const videosPair1 = ["video4", "video2", "video8"];
const videosPair2 = ["video7", "video5", "video6"];
const videosPair3 = ["video3", "video9", "video10", "video1"];

const imagesPair2: CarouselImage[] = [
	{
		src: "/static/temp/image6.gif",
		unoptimized: true,
		alt: "image6",
	},
	{
		src: "/static/temp/image5.gif",
		unoptimized: true,
		alt: "image6",
	},
];

function Dev() {
	return (
		<div className="w-screen h-screen flex justify-center">
			<ScrollContainer className="min-h-screen overflow-y-auto w-xl pt-4 border no-scrollbar">
				{videosPair1.map((src) => (
					<VideoPlayer
						key={src}
						src={`/static/temp/${src}.mp4`}
						aspectRatio={16 / 9}
						className="my-8"
						autoPlay
						autoPlayThreshold={0.8}
					/>
				))}

				{videosPair3.map((src) => (
					<VideoPlayer
						key={src}
						src={`/static/temp/${src}.mp4`}
						aspectRatio={4 / 5}
						className="my-8"
						autoPlay
						autoPlayThreshold={0.8}
					/>
				))}

				{videosPair2.map((src) => (
					<VideoPlayer
						key={src}
						src={`/static/temp/${src}.mp4`}
						aspectRatio={4 / 5}
						className="my-8"
						autoPlay
						autoPlayThreshold={0.8}
					/>
				))}

				<ImageCarousel images={imagesPair2} />
			</ScrollContainer>
		</div>
	);
}

export default Dev;
