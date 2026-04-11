import { ScrollContainer } from "@/components/layout/ScrollContainer";
import { ImageCarousel } from "@/primitives/ImageCarousel";
import { VideoPlayer } from "@/primitives/VideoPlayer";

const videosPair1 = ["video4", "video2", "video8"];
const videosPair2 = ["video7", "video5", "video6"];
const videosPair3 = ["video3", "video9", "video10", "video1"];

const imagesPair2 = [
	[
		{
			fileUrl: "/static/temp/image6.gif",
			fileType: "gif" as const,
		},
		{
			fileUrl: "/static/temp/image5.gif",
			fileType: "gif" as const,
		},
	],
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
				{imagesPair2.map((item) => (
					<ImageCarousel images={item} key={item[0].fileUrl} />
				))}
			</ScrollContainer>
		</div>
	);
}

export default Dev;
