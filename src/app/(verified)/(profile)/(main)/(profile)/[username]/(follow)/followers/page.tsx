import FollowHeader from "../FollowHeader";

const FollowersPage = async ({
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

export default FollowersPage;
