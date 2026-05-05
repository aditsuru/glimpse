/** biome-ignore-all lint/a11y/useSemanticElements: div is needed to be interactive */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: these divs are not interactive */
"use client";

import {
	Bookmark,
	ChartLine,
	Ellipsis,
	Heart,
	MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type * as z from "zod";
import { ImageCarousel } from "@/components/ImageCarousel";
import { VerifiedBadge } from "@/components/misc/VerifiedBadge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import { VideoPlayer } from "@/components/VideoPlayer";
import { cn } from "@/lib/client/utils";
import {
	DEFAULT_PFP_URL,
	isGif,
	isImage,
	isVideo,
} from "@/lib/shared/constants";
import HoverProfileCard from "@/modules/profile/components/HoverProfileCard";
import { useDelete } from "../post.queries";
import type { postSchema } from "../post.schema";

interface PostCardProps {
	className?: string;
	data: z.infer<typeof postSchema.get.output>;
	viewerUserId: string;
}

const PostCard = ({ className, data, viewerUserId }: PostCardProps) => {
	const router = useRouter();
	return (
		<div
			className={cn("p-4 flex flex-col gap-4", className)}
			role="button"
			tabIndex={0}
			onClick={() => router.push(`/posts/${data.id}`)}
			onKeyDown={(e) => e.key === "Enter" && router.push(`/posts/${data.id}`)}
		>
			<div className="flex gap-4 items-start">
				<Avatar className="size-10">
					<AvatarImage src={data.author.avatarUrl || DEFAULT_PFP_URL} />
				</Avatar>
				<div className="flex-1 min-w-0">
					<div
						className="text-lg font-semibold flex justify-between gap-1 items-center -mt-1"
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => e.stopPropagation()}
					>
						<div className="flex gap-1 items-center">
							<HoverCard>
								<HoverCardTrigger
									delay={10}
									render={
										<Link href={`/${data.author.username}`}>
											<p className="hover:underline hover:underline-offset-4">
												{data.author.displayName}
											</p>
										</Link>
									}
								/>
								<HoverCardContent className="w-xs rounded-xl bg-background">
									<HoverProfileCard username={data.author.username} />
								</HoverCardContent>
							</HoverCard>
							{data.author.isGlimpseVerified && (
								<VerifiedBadge className="size-4.5" />
							)}
							<p className="text-muted-foreground text-sm">
								@{data.author.username}
							</p>
						</div>
						<DropdownMenuSubmenu
							postId={data.id}
							viewerUserId={viewerUserId}
							authorId={data.author.id}
						/>
					</div>

					{/* Body */}
					<div
						className="flex flex-col gap-2"
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => e.stopPropagation()}
					>
						{data.body && (
							<p className="whitespace-break-spaces px-1">{data.body}</p>
						)}
						{data.hasAttachments && isVideo(data.attachments[0].mimeType) && (
							<VideoPlayer
								src={data.attachments[0].url}
								autoPlay
								spoiler={data.spoiler}
							/>
						)}
						{data.hasAttachments && isImage(data.attachments[0].mimeType) && (
							<ImageCarousel
								images={data.attachments.map((image, i) => {
									return {
										src: image.url,
										alt: `${data.id} - image ${i}`,
										unoptimized: isGif(image.mimeType),
									};
								})}
								spoiler={data.spoiler}
							/>
						)}
					</div>

					{/* Toolbar */}
					<div
						className="flex justify-between mt-2"
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => e.stopPropagation()}
					>
						<Button
							variant="ghost"
							className="flex gap-1 text-muted-foreground text-sm items-center rounded-2xl"
						>
							<Heart className="size-4.5" />
							<p>12k</p>
						</Button>
						<Button
							variant="ghost"
							className="flex gap-1 text-muted-foreground text-sm items-center rounded-2xl"
						>
							<MessageCircle className="size-4.5" />
							<p>12k</p>
						</Button>
						<Button
							variant="ghost"
							className="flex gap-1 text-muted-foreground text-sm items-center rounded-2xl"
						>
							<ChartLine className="size-4.5" />
							<p>12k</p>
						</Button>
						<Button
							variant="ghost"
							className="flex gap-1 text-muted-foreground text-sm items-center rounded-2xl"
						>
							<Bookmark className="size-4.5" />
							<p>12k</p>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

function DropdownMenuSubmenu({
	postId,
	viewerUserId,
	authorId,
}: {
	postId: string;
	authorId: string;
	viewerUserId: string;
}) {
	const deletePost = useDelete({ viewerUserId });

	const handleDelete = () => {
		deletePost.mutate({
			postId,
		});
	};

	const handleReport = () => {};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						variant="ghost"
						className="flex gap-1 text-muted-foreground text-sm items-center rounded-2xl"
					>
						<Ellipsis className="size-4.5" />
					</Button>
				}
			/>
			<DropdownMenuContent className="w-auto">
				<DropdownMenuGroup>
					{authorId === viewerUserId && (
						<DropdownMenuItem
							onClick={handleDelete}
							className="text-destructive hover:text-destructive!"
						>
							Delete
						</DropdownMenuItem>
					)}
					{authorId !== viewerUserId && (
						<DropdownMenuItem
							onClick={handleReport}
							className="text-destructive hover:text-destructive!"
						>
							Report
						</DropdownMenuItem>
					)}
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default PostCard;
