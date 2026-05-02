import FollowHeader from "../FollowHeader";

const FollowingPage = async ({
	params,
}: {
	params: Promise<{ username: string }>;
}) => {
	const { username } = await params;
	return (
		<main className="w-full">
			<FollowHeader username={username} />
		</main>
	);
};

export default FollowingPage;
