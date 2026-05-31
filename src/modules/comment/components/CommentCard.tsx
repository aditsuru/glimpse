"use client";

import { Ellipsis, Share } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import type * as z from "zod";
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
import { formatPostDate } from "@/lib/client/helpers";
import { config } from "@/lib/shared/config";
import { DEFAULT_PFP_URL } from "@/lib/shared/constants";
import { CommentLikeButton } from "@/modules/comment-like/components/CommentLikeButton";
import { HoverProfileCard } from "@/modules/profile/components/HoverProfileCard";
import { useViewerStore } from "@/store/use-viewer-store";
import { useDeleteComment } from "../comment.queries";
import type { getCommentOutput } from "../comment.schema";

interface CommentCardProps {
	data: z.infer<typeof getCommentOutput>;
	showReplies?: boolean;
	isNested?: boolean;
}

export const CommentCard = ({
	data,
	showReplies = true,
	isNested = false,
}: CommentCardProps) => {
	const [repliesOpen, setRepliesOpen] = useState(false);

	return (
		<div className="w-full h-full py-2 p-4 flex gap-3 items-start">
			{/* Avatar column — grows to fill height when replies are open so the vertical line reaches down */}
			<div className="flex flex-col items-center self-stretch">
				<Avatar className="shrink-0">
					<AvatarImage src={data.author.avatarUrl ?? DEFAULT_PFP_URL} />
				</Avatar>
				{/* Vertical connector line: only on top-level comments while replies are expanded */}
				{!isNested && repliesOpen && (
					<div className="w-[2px] bg-border flex-1 mt-1" />
				)}
			</div>

			<div className="flex-1 flex flex-col">
				{/* Header row */}
				<div className="text-base font-semibold flex justify-between gap-2 items-center -mt-1 flex-1">
					<div className="flex justify-between gap-1 items-center">
						<HoverCard>
							<HoverCardTrigger
								delay={300}
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
						authorId={data.author.id}
						commentId={data.id}
					/>
				</div>

				{/* Body */}
				<div>
					<p className="whitespace-break-spaces -mt-1">{data.body}</p>
				</div>

				{/* Action bar */}
				<div className="flex items-center gap-4">
					<CommentLikeButton
						commentId={data.id}
						initialCount={data.likesCount}
						initialState={data.isLikedByUser}
					/>
					<Button
						variant="ghost"
						className="flex gap-1 text-muted-foreground/80 text-sm items-center rounded-2xl hover:bg-transparent! px-0!"
						title="Share"
						onClick={() => {
							navigator.clipboard.writeText(
								`${config.NEXT_PUBLIC_APP_URL}/p/${data.postId}?highlight=${data.id}`
							);
							toast.success("Link copied to clipboard.");
						}}
					>
						<Share className="size-4.5" />
					</Button>
				</div>

				{/* Nested replies — only mounted after the user clicks "Show Replies" */}
				{showReplies && repliesOpen && (
					<div className="flex items-start mt-2">
						{/* L-shaped Reddit connector: vertical bar sits to the left, horizontal stub leads to the nested avatar */}
						<div
							className="shrink-0 self-stretch"
							style={{ width: 16, marginLeft: -28 }}
						>
							<div
								className="border-l-2 border-b-2 border-border rounded-bl-md"
								style={{ width: 16, height: 20, marginTop: 4 }}
							/>
						</div>

						<div className="flex-1">
							<CommentCard data={data} showReplies={false} isNested={true} />
						</div>
					</div>
				)}

				{/* Show / Hide Replies — always at the bottom, only on top-level comments */}
				{!isNested && (
					<Button
						variant="ghost"
						className="flex gap-1 text-muted-foreground text-sm items-center rounded-2xl hover:bg-transparent! px-0! w-fit mt-1 hover:text-muted-foreground/80"
						onClick={() => setRepliesOpen((prev) => !prev)}
					>
						{repliesOpen ? "Hide Replies" : "Show Replies"}
					</Button>
				)}
			</div>
		</div>
	);
};

interface DropdownMenuSubmenu {
	commentId: string;
	postId: string;
	authorId: string;
}

const DropdownMenuSubmenu = ({
	commentId,
	postId,
	authorId,
}: DropdownMenuSubmenu) => {
	const { userId } = useViewerStore();

	const deletePost = useDeleteComment({ postId });

	const handleDelete = () => {
		deletePost.mutate({
			commentId,
		});
	};

	const handleReport = () => {};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						variant="ghost"
						className="flex gap-1 text-muted-foreground text-sm items-center rounded-2xl hover:bg-transparent! aria-expanded:bg-transparent! px-0!"
					>
						<Ellipsis className="size-4.5" />
					</Button>
				}
			/>
			<DropdownMenuContent className="w-auto">
				<DropdownMenuGroup>
					{authorId === userId && (
						<DropdownMenuItem
							onClick={handleDelete}
							className="text-destructive hover:text-destructive!"
						>
							Delete
						</DropdownMenuItem>
					)}
					{authorId !== userId && (
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
};
