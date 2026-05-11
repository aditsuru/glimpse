"use client";

import { ORPCError } from "@orpc/client";
import { EmptyStateMessage } from "@/components/layout/EmptyStateMessage";
import { ErrorMessage } from "@/components/layout/ErrorMessage";
import { PageHeader } from "@/components/layout/PageHeader";
import { Separator } from "@/components/ui/separator";
import { ScrollContainer } from "@/components/VideoPlayer";
import { CommentComposer } from "@/modules/comment/components/CommentComposer";
import { PostComments } from "@/modules/comment/components/PostComments";
import { PostCard } from "@/modules/post/components/PostCard";
import { usePost } from "@/modules/post/post.queries";

interface PostPageProps {
	postId: string;
	viewerUserId: string;
}

export const PostPage = ({ postId, viewerUserId }: PostPageProps) => {
	const { data, error, isLoading } = usePost(postId);

	if (error) {
		if (error instanceof ORPCError && error.code === "NOT_FOUND") {
			return <EmptyStateMessage title="This post no longer exists" />;
		}
		return <ErrorMessage />;
	}

	if (!data || isLoading) return;

	return (
		<ScrollContainer className="flex flex-col w-full h-full overflow-y-auto no-scrollbar">
			<PageHeader title="Post" />
			<div className="flex-1">
				<PostCard
					data={data}
					viewerUserId={viewerUserId}
					leftMargin={false}
					profileRow
					separator
				/>
				<div className="px-8">
					<Separator />
				</div>

				<CommentComposer viewerUserId={viewerUserId} postId={postId} />
				<PostComments viewerUserId={viewerUserId} postId={postId} />
			</div>
		</ScrollContainer>
	);
};
