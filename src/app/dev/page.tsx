import { ScrollContainer } from "@/components/layout/ScrollContainer";
import { ImageCarousel } from "@/primitives/ImageCarousel";
import { VideoPlayer } from "@/primitives/VideoPlayer";

const videosPair1 = ["video1", "video2", "video3"];
const videosPair2 = ["video4", "video5", "video6"];
const videosPair3 = ["video7"];

const imagesPair1 = [
	[
		{
			fileUrl: "/static/temp/image2.jpg",
			fileType: "image" as const,
		},
		{
			fileUrl: "/static/temp/image3.jpg",
			fileType: "image" as const,
		},
	],
];

const imagesPair2 = [
	[
		{
			fileUrl: "/static/temp/image1.jpg",
			fileType: "image" as const,
		},
		{
			fileUrl: "/static/temp/image6.gif",
			fileType: "image" as const,
		},
		{
			fileUrl: "/static/temp/image5.gif",
			fileType: "image" as const,
		},
	],
];
const imagesPair3 = [
	[
		{
			fileUrl: "/static/temp/image4.jpg",
			fileType: "image" as const,
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
				{imagesPair1.map((item) => (
					<ImageCarousel
						images={item}
						key={item[0].fileUrl}
						spoiler
						aspectRatio={16 / 9}
					/>
				))}
				{videosPair3.map((src) => (
					<VideoPlayer
						key={src}
						src={`/static/temp/${src}.mp4`}
						aspectRatio={16 / 9}
						className="my-8"
						autoPlay
						autoPlayThreshold={0.8}
						spoiler
					/>
				))}

				{imagesPair2.map((item) => (
					<ImageCarousel images={item} key={item[0].fileUrl} spoiler />
				))}
				{videosPair2.map((src) => (
					<VideoPlayer
						key={src}
						src={`/static/temp/${src}.mp4`}
						aspectRatio={16 / 9}
						className="my-8"
						autoPlay
						autoPlayThreshold={0.8}
					/>
				))}
				{imagesPair3.map((item) => (
					<ImageCarousel images={item} key={item[0].fileUrl} />
				))}
			</ScrollContainer>
		</div>
	);
}

export default Dev;
