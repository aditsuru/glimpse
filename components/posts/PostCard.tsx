type Attachment = {
	fileUrl: string;
	fileType: string;
};

interface PostCardProps {
	id: string;
	userId: string;
	body: string;
	hasAttachaments: boolean;
	createdAt: Date;
	attachments?: Attachment[];
	hasUserLiked: boolean;
	hasUserBookmarked: boolean;
	likes: number;
	comments: number;
	bookmarks: number;
	views: number;
	authorName: string;
	authorUsername: string;
	authorAvatarUrl: string;
	authorIsVerified: string;
}

function PostCard({
	id,
	userId,
	body,
	hasAttachaments,
	createdAt,
	attachments,
	hasUserLiked,
	hasUserBookmarked,
	likes,
	comments,
	bookmarks,
	views,
	authorName,
	authorUsername,
	authorAvatarUrl,
	authorIsVerified,
}: PostCardProps) {
	return <div>PostCard</div>;
}

export default PostCard;
