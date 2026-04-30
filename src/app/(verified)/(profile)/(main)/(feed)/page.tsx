"use client";

import { type CarouselImage, ImageCarousel } from "@/components/ImageCarousel";
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
		<div className="w-full h-full flex flex-col items-center">
			<div className="w-full h-20 border-b-2 text-center pt-4">
				<h2 className="text-lg underline underline-offset-8 decoration-primary decoration-2 font-semibold">
					For You
				</h2>
			</div>
			<ScrollContainer className="min-h-screen overflow-y-auto w-full no-scrollbar px-4 mt-1">
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
