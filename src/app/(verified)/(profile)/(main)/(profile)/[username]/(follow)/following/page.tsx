import { FollowHeader } from "../FollowHeader";
import { FollowingPage } from "./FollowingPage";

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
				<FollowingPage username={username} />
			</div>
		</main>
	);
}
