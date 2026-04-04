import { VideoPlayer } from "@/components/media/VideoPlayer";
import { AspectRatio } from "@/components/ui/aspect-ratio";

function Home() {
	return (
		<div className="h-full w-full flex justify-center items-center">
			<AspectRatio ratio={16 / 9}>
				<VideoPlayer src="/static/video.mp4" />
			</AspectRatio>
		</div>
	);
}

export default Home;
