"use client";

import PostLikedFeed from "@/modules/postLike/components/PostLikedFeed";
import { useProfileContext } from "../ProfileContext";

const Page = () => {
	const { username } = useProfileContext();

	return <PostLikedFeed username={username} />;
};

export default Page;
