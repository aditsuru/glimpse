"use client";

import { authClient } from "@/lib/client/auth-client";
import { HoverProfileCard } from "@/modules/profile/components/HoverProfileCard";
import { useProfile } from "@/modules/profile/profile.queries";

function Dev() {
	const { data: sessionData } = authClient.useSession();
	const { data } = useProfile({
		userId: sessionData?.user.id,
	});

	if (!data) return;
	return (
		<div className="w-screen h-dvh flex justify-center items-center">
			<HoverProfileCard data={data} handleFollow={() => {}} />
		</div>
	);
}

export default Dev;
