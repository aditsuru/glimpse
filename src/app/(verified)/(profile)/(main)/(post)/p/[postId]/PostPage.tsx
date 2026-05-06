"use client";

import { ORPCError } from "@orpc/client";
import EmptyStateMessage from "@/components/layout/EmptyStateMessage";
import ErrorMessage from "@/components/layout/ErrorMessage";
import PageHeader from "@/components/layout/PageHeader";
import PostCard from "@/modules/post/components/PostCard";
import { usePost } from "@/modules/post/post.queries";

const PostPage = ({
	postId,
	viewerId,
}: {
	postId: string;
	viewerId: string;
}) => {
	const { data, error, isLoading } = usePost(postId);

	if (error) {
		if (error instanceof ORPCError && error.code === "NOT_FOUND") {
			return <EmptyStateMessage title="This post no longer exists" />;
		}
		return <ErrorMessage />;
	}

	if (!data || isLoading) return;

	return (
		<div className="flex flex-col w-full h-full overflow-y-auto no-scrollbar">
			<PageHeader title="Post" />
			<div className="flex-1">
				<PostCard
					data={data}
					viewerUserId={viewerId}
					leftMargin={false}
					profileRow
					separator
					className="border-b"
				/>
			</div>
		</div>
	);
};

export default PostPage;
