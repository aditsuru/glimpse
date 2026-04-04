"use client";

// import { MediaCarousel } from "@/components/media/MediaCarousel";
import type { AttachmentType } from "@/lib/constants";

type Attachment = {
	fileUrl: string;
	fileType: AttachmentType;
};

function Home() {
	const mockAttachments: Attachment[] = [
		{
			fileUrl:
				"https://i.pinimg.com/736x/94/39/9d/94399d7738c763acbeab977f6217a18a.jpg",
			fileType: "image",
		},
		{
			fileUrl:
				"https://i.pinimg.com/736x/9e/cd/e9/9ecde97380d748d864ad5f1273f97431.jpg",
			fileType: "image",
		},
		{
			fileUrl:
				"https://i.pinimg.com/736x/e2/2e/a5/e22ea574a9fbf22006841019c218b6f0.jpg",
			fileType: "image",
		},
		{
			fileUrl: "/static/video.mp4",
			fileType: "video",
		},
	];

	return (
		<div className="h-full w-full flex justify-center items-center">
			{/* <MediaCarousel attachments={mockAttachments} /> */}
		</div>
	);
}

export default Home;
