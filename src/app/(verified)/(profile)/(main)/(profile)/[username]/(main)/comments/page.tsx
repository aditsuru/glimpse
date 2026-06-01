"use client";

import { useProfileContext } from "@/app/(verified)/(profile)/(main)/(profile)/[username]/(main)/ProfileContext";
import { UserCommentsFeed } from "@/modules/comment/components/UserCommentsFeed";

export default function Page() {
	const { username } = useProfileContext();
	return <UserCommentsFeed username={username} />;
}
