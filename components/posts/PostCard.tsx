"use client";

import {
	BadgeCheck,
	Bookmark,
	ChartNoAxesColumn,
	EllipsisVertical,
	Heart,
	MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { initials, timeAgo } from "@/lib/utils";
import type { PostOutput } from "@/server/shared/schemas/post";
import { ImageCarousel } from "../media/ImageCarousel";
import { VideoPlayer } from "../media/VideoPlayer";
import { AspectRatio } from "../ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { PostBody } from "./PostBody";

function formatCount(n: number) {
	if (n < 1000) return n.toString();
	if (n < 1000000) return `${(n / 1000).toFixed(1)}k`;
	return `${(n / 1000000).toFixed(1)}m`;
}

function PostCard({
	id,
	userId,
	body,
	hasAttachments,
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
}: PostOutput) {
	const images =
		attachments?.filter(
			(a) => a.fileType === "image" || a.fileType === "gif"
		) ?? [];
	const video = attachments?.find((a) => a.fileType === "video");

	return (
		<Card className="w-lg bg-background flex flex-col gap-3 p-4">
			{/* Header */}
			<div className="flex gap-3 items-start">
				<Link href={`/user/${authorUsername}`}>
					<Avatar size="lg">
						<AvatarImage src={authorAvatarUrl || ""} alt={authorName} />
						<AvatarFallback>{initials(authorName)}</AvatarFallback>
					</Avatar>
				</Link>

				<div className="flex flex-col gap-1 flex-1 min-w-0">
					{/* Author row */}
					<div className="flex items-center gap-2 flex-wrap">
						<div className="flex items-center gap-1 flex-wrap">
							<Link
								className="font-semibold text-sm leading-none hover:underline"
								href={`/user/${authorUsername}`}
							>
								{authorName}
							</Link>
							{authorIsVerified && (
								<BadgeCheck size={20} className="text-chart-2 shrink-0" />
							)}
						</div>
						<div className="flex items-center gap-1 flex-wrap">
							<Link
								className="text-muted-foreground text-sm hover:underline"
								href={`/user/${authorUsername}`}
							>
								@{authorUsername}
							</Link>
							<span className="text-muted-foreground text-sm">·</span>
							<span className="text-muted-foreground text-sm">
								{timeAgo(createdAt)}
							</span>
						</div>
					</div>

					{/* Body */}
					{body && (
						<div className={hasAttachments ? "mb-2 text-sm" : "text-sm"}>
							<PostBody content={body} />
						</div>
					)}

					{/* Media */}
					{hasAttachments && images.length > 0 && (
						<ImageCarousel attachments={images} />
					)}

					{hasAttachments && video && (
						<AspectRatio ratio={16 / 9}>
							<VideoPlayer src={video.fileUrl} />
						</AspectRatio>
					)}

					{/* Actions */}
					<div className="flex items-center gap-1 mt-1 -ml-2 justify-between">
						<Button
							variant="ghost"
							size="sm"
							className="gap-1.5 text-muted-foreground hover:bg-transparent!"
						>
							<Heart
								size={16}
								className={
									hasUserLiked ? "fill-destructive text-destructive" : ""
								}
							/>
							<span className="text-xs">{formatCount(likes)}</span>
						</Button>

						<Button
							variant="ghost"
							size="sm"
							className="gap-1.5 text-muted-foreground hover:bg-transparent!"
						>
							<MessageCircle size={16} />
							<span className="text-xs">{formatCount(comments)}</span>
						</Button>

						<Button
							variant="ghost"
							size="sm"
							className="gap-1.5 text-muted-foreground hover:bg-transparent!"
						>
							<Bookmark
								size={16}
								className={
									hasUserBookmarked ? "fill-foreground text-foreground" : ""
								}
							/>
							<span className="text-xs">{formatCount(bookmarks)}</span>
						</Button>

						<Button variant="ghost" size="sm" className="gap-1.5" disabled>
							<ChartNoAxesColumn size={16} />
							<span className="text-xs">{formatCount(views)}</span>
						</Button>

						<Button
							variant="ghost"
							size="sm"
							className="gap-1.5 text-muted-foreground hover:bg-transparent!"
						>
							<EllipsisVertical size={16} />
						</Button>
					</div>
				</div>
			</div>
		</Card>
	);
}

export default PostCard;
