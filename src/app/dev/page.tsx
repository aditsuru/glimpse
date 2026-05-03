"use client";

import { Switch } from "@/components/ui/switch";
import { authClient } from "@/lib/client/auth-client";
import { useProfile } from "@/modules/profile/profile.queries";

function Dev() {
	const { data: sessionData } = authClient.useSession();
	const { data } = useProfile({
		userId: sessionData?.user.id,
	});

	if (!data) return;
	return (
		<main className="w-full h-full overflow-y-auto no-scrollbar">
			<section className="flex flex-col gap-8 py-8 px-12">
				<div className="flex items-center justify-between max-w-sm">
					<div>
						<p className="font-medium">Private Account</p>
						<p className="text-sm text-muted-foreground">description</p>
					</div>
					<Switch />
				</div>
			</section>
		</main>
	);
}

export default Dev;
