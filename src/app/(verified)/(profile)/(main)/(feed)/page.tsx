"use client";

import { ScrollContainer } from "@/components/VideoPlayer";
import { authClient } from "@/lib/client/auth-client";
import PostCard from "@/modules/post/components/PostCard";
import { usePost } from "@/modules/post/post.queries";

function Feed() {
	const { data: sessionData } = authClient.useSession();
	const { data } = usePost("FvxPP7cgzbBNo6KrrLwD1");
	const { data: data2 } = usePost("EAw23PoYAWApeYQ7QnaXh");
	const { data: data3 } = usePost("3vNW1ZFvEZyFhnLLpVR8E");

	if (!data || !data2 || !data3) return;
	return (
		<div className="w-full h-full flex flex-col items-center">
			<div className="w-full h-20 border-b-2 text-center pt-4">
				<h2 className="text-lg font-semibold py-2 relative">
					For You
					<span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-primary rounded-full" />
				</h2>
			</div>
			<ScrollContainer className="min-h-screen overflow-y-auto w-full no-scrollbar">
				<div className="w-full mb-16">
					<PostCard data={data} viewerUserId={sessionData?.user.id || ""} />
					<PostCard data={data} viewerUserId={sessionData?.user.id || ""} />
					<PostCard data={data2} viewerUserId={sessionData?.user.id || ""} />
					<PostCard data={data3} viewerUserId={sessionData?.user.id || ""} />
				</div>
			</ScrollContainer>
		</div>
	);
}

export default Feed;
