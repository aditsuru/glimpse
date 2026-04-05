import type { AttachmentWithoutKey } from "@/server/shared/schemas/post";
import { ImageCarousel } from "../media/ImageCarousel";
import { VideoPlayer } from "../media/VideoPlayer";
import { AspectRatio } from "../ui/aspect-ratio";

interface CompactPostMediaProps {
	attachments: AttachmentWithoutKey[];
}

export function CompactPostMedia({ attachments }: CompactPostMediaProps) {
	const video = attachments.find((a) => a.fileType === "video");
	const hasImages = attachments.some(
		(a) => a.fileType === "image" || a.fileType === "gif"
	);

	if (!hasImages && video) {
		return (
			<AspectRatio
				ratio={16 / 9}
				className="w-full rounded-md overflow-hidden bg-muted"
				onClick={(e) => e.stopPropagation()}
			>
				<VideoPlayer src={video.fileUrl} />
			</AspectRatio>
		);
	}

	if (hasImages) {
		return <ImageCarousel attachments={attachments} />;
	}

	return null;
}
