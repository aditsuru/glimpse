/** biome-ignore-all lint/a11y/useSemanticElements: div is needed to be interactive */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: these divs are not interactive */
"use client";

import {
	Bookmark,
	ChartLine,
	Ellipsis,
	Heart,
	MessageCircle,
	Share,
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
import { Separator } from "@/components/ui/separator";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useViewCount } from "@/hooks/useViewCount";
import { formatPostDate } from "@/lib/client/helpers";
import { cn } from "@/lib/client/utils";
import {
	DEFAULT_PFP_URL,
	isGif,
	isImage,
	isVideo,
} from "@/lib/shared/constants";
import HoverProfileCard from "@/modules/profile/components/HoverProfileCard";
import { useDelete, useMarkPostSeen } from "../post.queries";
import type { postSchema } from "../post.schema";

interface PostCardProps {
	className?: string;
	data: z.infer<typeof postSchema.get.output>;
	viewerUserId: string;
	leftMargin?: boolean;
	profileRow?: boolean;
	separator?: boolean;
}

const PostCard = ({
	className,
	data,
	viewerUserId,
	leftMargin = true,
	profileRow = false,
	separator = false,
}: PostCardProps) => {
	const router = useRouter();
	const updateViewCount = useMarkPostSeen();
	const ref = useViewCount(data.id, () =>
		updateViewCount.mutate({
			postId: data.id,
		})
	);

	return (
		<div
			className={cn("p-4 flex flex-col", className)}
			role="button"
			tabIndex={0}
			onClick={() => router.push(`/p/${data.id}`)}
			onKeyDown={(e) => e.key === "Enter" && router.push(`/p/${data.id}`)}
			ref={ref}
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
						<div
							className={cn("flex", {
								"flex-col": profileRow,
								"gap-1 items-center": !profileRow,
							})}
						>
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
								{`@${data.author.username} · ${formatPostDate(data.createdAt)}`}
							</p>
						</div>
						<DropdownMenuSubmenu
							postId={data.id}
							viewerUserId={viewerUserId}
							authorId={data.author.id}
						/>
					</div>
				</div>
			</div>

			{/* Body */}
			<div
				className={cn("flex flex-col gap-2 mt-3", {
					"md:pl-14 md:-mt-2": leftMargin,
				})}
			>
				{data.body && (
					<div
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => e.stopPropagation()}
					>
						<p className="whitespace-break-spaces px-1">{data.body}</p>
					</div>
				)}
				{data.hasAttachments && isVideo(data.attachments[0].mimeType) && (
					<div
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => e.stopPropagation()}
					>
						<VideoPlayer
							src={data.attachments[0].url}
							autoPlay
							spoiler={data.spoiler}
						/>
					</div>
				)}
				{data.hasAttachments && isImage(data.attachments[0].mimeType) && (
					<div
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => e.stopPropagation()}
					>
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
					</div>
				)}
			</div>

			{separator && <Separator className="mt-8" />}
			{/* Toolbar */}
			<div
				className={cn("mt-3 flex justify-between", {
					"md:pl-14": leftMargin,
					"mt-2 -mb-2": separator,
				})}
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
					<p>{data.views === 0 ? "1" : data.views}</p>
				</Button>
				<Button
					variant="ghost"
					className="flex gap-1 text-muted-foreground text-sm items-center rounded-2xl"
				>
					<Bookmark className="size-4.5" />
					<p>12k</p>
				</Button>
				<Button
					variant="ghost"
					className="flex gap-1 text-muted-foreground text-sm items-center rounded-2xl"
				>
					<Share className="size-4.5" />
				</Button>
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
