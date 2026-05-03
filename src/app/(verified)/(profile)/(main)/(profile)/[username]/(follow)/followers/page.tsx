import FollowHeader from "../FollowHeader";
import FollowersPage from "./FollowersPage";

const Page = async ({ params }: { params: Promise<{ username: string }> }) => {
	const { username } = await params;
	return (
		<main className="w-full h-full overflow-y-auto no-scrollbar flex flex-col">
			<FollowHeader username={username} />
			<div className="flex-1">
				<FollowersPage username={username} />
			</div>
		</main>
	);
};

export default Page;
