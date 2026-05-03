import FollowHeader from "../FollowHeader";
import FollowersPage from "./FollowersPage";

const Page = async ({ params }: { params: Promise<{ username: string }> }) => {
	const { username } = await params;
	return (
		<main className="w-full">
			<FollowHeader username={username} />
			<FollowersPage username={username} />
		</main>
	);
};

export default Page;
