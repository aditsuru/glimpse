import type { Metadata } from "next";
import { buildMetadata } from "@/lib/shared/metadata";
import { FollowHeader } from "../FollowHeader";
import { FollowersPage } from "./FollowersPage";

export const metadata: Metadata = buildMetadata({
	title: "Followers",
	noindex: true,
});

export default async function Page({
	params,
}: {
	params: Promise<{ username: string }>;
}) {
	const { username } = await params;
	return (
		<main className="w-full h-full overflow-y-auto no-scrollbar flex flex-col">
			<FollowHeader username={username} />
			<div className="flex-1">
				<FollowersPage username={username} />
			</div>
		</main>
	);
}
