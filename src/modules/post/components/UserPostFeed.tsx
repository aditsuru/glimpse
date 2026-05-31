import { ORPCError } from "@orpc/client";
import { Lock } from "lucide-react";
import { EmptyStateMessage } from "@/components/layout/EmptyStateMessage";
import { Loader } from "@/components/misc/Loader";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useViewerStore } from "@/store/use-viewer-store";
import { useGetAllByUser } from "../post.queries";
import { PostCard } from "./PostCard";

interface UserPostFeedProps {
	username: string;
	userId: string;
}

export const UserPostFeed = ({ username, userId }: UserPostFeedProps) => {
	const { userId: viewerUserId } = useViewerStore();
	const {
		data,
		fetchNextPage,
		hasNextPage,
		error,
		isLoading,
		isFetchingNextPage,
	} = useGetAllByUser(username);

	const ref = useInfiniteScroll(fetchNextPage, isFetchingNextPage);
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
					<PostCard data={post} />
				</div>
			))}
			{isLoading && (
				<div className="py-8 flex justify-center w-full">
					<Loader />
				</div>
			)}
			{hasNextPage && (
				<div ref={ref} className="py-12 flex justify-center w-full">
					<Loader />
				</div>
			)}
			{posts.length === 0 && !isLoading && (
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
