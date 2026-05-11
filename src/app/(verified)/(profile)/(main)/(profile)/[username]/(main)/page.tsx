"use client";

import { UserPostFeed } from "@/modules/post/components/UserPostFeed";
import { useProfile } from "@/modules/profile/profile.queries";
import { useProfileContext } from "./ProfileContext";

export default function Page() {
	const { username } = useProfileContext();
	const { data } = useProfile({ username });

	return <UserPostFeed username={username} userId={data?.userId ?? ""} />;
}
