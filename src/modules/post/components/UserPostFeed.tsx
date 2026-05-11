import { ORPCError } from "@orpc/client";
import { Lock } from "lucide-react";
import { EmptyStateMessage } from "@/components/layout/EmptyStateMessage";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { authClient } from "@/lib/client/auth-client";
import { useGetAllByUser } from "../post.queries";
import { PostCard } from "./PostCard";

interface UserPostFeedProps {
	username: string;
	userId: string;
	viewerUserId: string;
}

export const UserPostFeed = ({
	username,
	userId,
	viewerUserId,
}: UserPostFeedProps) => {
	const { data: sessionData } = authClient.useSession();
	const { data, fetchNextPage, hasNextPage, isFetching, error } =
		useGetAllByUser(username);

	const ref = useInfiniteScroll(fetchNextPage, isFetching);
	const posts = data?.pages.flatMap((post) => post.items) ?? [];

	if (error && error instanceof ORPCError && error.code === "FORBIDDEN")
		return (
			<EmptyStateMessage
				Icon={Lock}
				title="This account is private"
				description={`Follow ${username} to see their posts`}
			/>
		);

	return (
		<div className="w-full h-full">
			{posts.map((post) => (
				<div key={post.id} className="border-b border-accent">
					<PostCard data={post} viewerUserId={sessionData?.user.id || ""} />
				</div>
			))}
			{hasNextPage && <div ref={ref} className="h-1" />}
			{posts.length === 0 && !isFetching && (
				<EmptyStateMessage
					title="No posts yet"
					description={
						userId === viewerUserId
							? `You haven't posted anything yet`
							: `${username} hasn't posted anything yet`
					}
				/>
			)}
		</div>
	);
};
