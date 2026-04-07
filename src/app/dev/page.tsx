import { ScrollContainer } from "@/components/layout/ScrollContainer";
import { VideoPlayer } from "@/primitives/VideoPlayer";

const Videos = [
	"video",
	"grok",
	"miside",
	"screenshot",
	"sukuna",
	"kawaii",
	"edit",
];

function Dev() {
	return (
		<div className="w-screen h-screen flex justify-center">
			<ScrollContainer className="min-h-screen overflow-y-auto w-xl pt-4 border no-scrollbar">
				{Videos.map((src) => (
					<VideoPlayer
						key={src}
						src={`/static/${src}.mp4`}
						aspectRatio={16 / 9}
						className="my-8"
						autoPlay
						autoPlayThreshold={0.8}
						spoiler
					/>
				))}
			</ScrollContainer>
		</div>
	);
}

export default Dev;
