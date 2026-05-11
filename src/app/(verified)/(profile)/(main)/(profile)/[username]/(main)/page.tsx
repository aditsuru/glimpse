"use client";

import { authClient } from "@/lib/client/auth-client";
import { UserPostFeed } from "@/modules/post/components/UserPostFeed";
import { useProfile } from "@/modules/profile/profile.queries";
import { useProfileContext } from "./ProfileContext";

export default function Page() {
	const { username } = useProfileContext();
	const { data } = useProfile({ username });
	const { data: session } = authClient.useSession();

	return (
		<UserPostFeed
			username={username}
			viewerUserId={session?.user.id ?? ""}
			userId={data?.userId ?? ""}
		/>
	);
}
