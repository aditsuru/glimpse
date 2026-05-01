import { getRequiredSession } from "@/lib/server/auth-utils";
import ProfilePage from ".././ProfilePage";

const Page = async ({ params }: { params: Promise<{ username: string }> }) => {
	const { username } = await params;
	const { user } = await getRequiredSession();
	return <ProfilePage username={username} viewerId={user.id} />;
};

export default Page;
