"use client";

import PostComposer from "@/modules/post/components/PostComposer";

function Dev() {
	return (
		<main className="w-screen h-dvh flex flex-col items-center justify-center">
			<div className="w-lg">
				<PostComposer />
			</div>
		</main>
	);
}

export default Dev;
