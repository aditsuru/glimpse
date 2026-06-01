"use client";

import { useEffect, useState } from "react";
import type * as z from "zod";
import type { postSchema } from "@/modules/post/post.schema";

interface BillboardVideoProps {
	posts: z.infer<typeof postSchema.getBillboard.output>;
	transitionVideo: string;
}

export const BillboardVideo = ({
	posts,
	transitionVideo,
}: BillboardVideoProps) => {
	const [phase, setPhase] = useState<"transition" | "post">("transition");
	const [postIdx, setPostIdx] = useState(0);

	const noPosts = posts.length === 0;

	useEffect(() => {
		if (noPosts || phase === "transition") return;

		const timer = setTimeout(() => {
			setPhase("transition");
			setPostIdx((prev) => (prev + 1) % posts.length);
		}, 15000);

		return () => clearTimeout(timer);
	}, [phase, noPosts, posts.length]);

	const handleTransitionEnded = () => {
		if (noPosts) return;
		setPhase("post");
	};

	if (noPosts || phase === "transition") {
		return (
			<video
				src={transitionVideo}
				autoPlay
				muted
				playsInline
				loop={noPosts}
				onEnded={noPosts ? undefined : handleTransitionEnded}
				style={{
					width: "100%",
					height: "100%",
					objectFit: "cover",
					objectPosition: "center",
					display: "block",
				}}
			/>
		);
	}

	const currentPost = posts[postIdx];
	const media = currentPost.attachments[0];

	return (
		<video
			key={`post-${currentPost.id}`}
			src={media.url}
			autoPlay
			muted
			loop
			playsInline
			style={{
				width: "100%",
				height: "100%",
				objectFit: "cover",
				objectPosition: "center",
				display: "block",
			}}
		/>
	);
};
