import FollowHeader from "../FollowHeader";
import FollowingPage from "./FollowingPage";

const Page = async ({ params }: { params: Promise<{ username: string }> }) => {
	const { username } = await params;
	return (
		<main className="w-full">
			<FollowHeader username={username} />
			<FollowingPage username={username} />
		</main>
	);
};

export default Page;
