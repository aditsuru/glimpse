"use client";

import { authClient } from "@/lib/client/auth-client";
import ProfileCard from "@/modules/profile/components/ProfileCard";
import { useProfile } from "@/modules/profile/profile.queries";

function Dev() {
	const { data: sessionData } = authClient.useSession();
	const { data } = useProfile({
		userId: sessionData?.user.id,
	});

	if (!data) return;
	return (
		<div className="w-screen h-dvh flex justify-center items-center">
			<div className="w-lg">
				<ProfileCard data={data} className="border rounded-full" />
			</div>
		</div>
	);
}

export default Dev;
