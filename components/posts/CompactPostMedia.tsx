import Image from "next/image";
import type { AttachmentWithoutKey } from "@/server/shared/schemas/post";
import { VideoPlayer } from "../media/VideoPlayer";
import { AspectRatio } from "../ui/aspect-ratio";

interface CompactPostMediaProps {
	attachments: AttachmentWithoutKey[];
}

export function CompactPostMedia({ attachments }: CompactPostMediaProps) {
	const images = attachments.filter(
		(a) => a.fileType === "image" || a.fileType === "gif"
	);
	const video = attachments.find((a) => a.fileType === "video");

	if (video && images.length === 0) {
		return (
			<AspectRatio
				ratio={16 / 9}
				className="elative w-full rounded-md overflow-hidden bg-muted"
				onClick={(e) => e.stopPropagation()}
			>
				<VideoPlayer src={video.fileUrl} />
			</AspectRatio>
		);
	}

	if (images.length === 1) {
		return (
			<div className="relative w-full aspect-video rounded-md overflow-hidden bg-muted">
				<Image
					src={images[0].fileUrl}
					alt="Post image"
					fill
					className="object-cover"
					unoptimized
				/>
			</div>
		);
	}

	if (images.length >= 2) {
		const display = images.slice(0, 4);
		const cols = display.length === 2 ? "grid-cols-2" : "grid-cols-2";
		const rows = display.length <= 2 ? "grid-rows-1" : "grid-rows-2";

		return (
			<div
				className={`grid ${cols} ${rows} gap-0.5 rounded-md overflow-hidden aspect-video`}
			>
				{display.map((img) => (
					<div key={img.fileUrl} className="relative bg-muted overflow-hidden">
						<Image
							src={img.fileUrl}
							alt="Post image"
							fill
							className="object-cover"
							unoptimized
						/>
						{/* overlay showing +N if more than 4 */}
						{img === display[3] && images.length > 4 && (
							<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
								<span className="text-white font-semibold text-sm">
									+{images.length - 4}
								</span>
							</div>
						)}
					</div>
				))}
			</div>
		);
	}

	return null;
}
