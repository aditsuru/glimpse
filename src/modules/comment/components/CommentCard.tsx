"use client";

import { Ellipsis, Heart, Share } from "lucide-react";
import Link from "next/link";
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
import { HoverProfileCard } from "@/modules/profile/components/HoverProfileCard";
import { useDeleteComment } from "../comment.queries";
import type { getCommentOutput } from "../comment.schema";

interface CommentCardProps {
	data: z.infer<typeof getCommentOutput>;
	viewerUserId: string;
}

export const CommentCard = ({ data, viewerUserId }: CommentCardProps) => {
	return (
		<div className="w-full h-full py-2 p-4 flex gap-3 items-start">
			<div className="flex flex-col items-center self-stretch">
				<Avatar>
					<AvatarImage src={data.author.avatarUrl ?? DEFAULT_PFP_URL} />
				</Avatar>
				{/* For nested replies - Later: */}
				{/* <div className="w-[2px] flex-1 bg-border" /> */}
			</div>
			<div className="flex-1 flex flex-col">
				<div className="text-base font-semibold flex justify-between gap-2 items-center -mt-1 flex-1">
					<div className="flex justify-between gap-2 items-center">
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
						viewerUserId={viewerUserId}
						authorId={data.author.id}
						commentId={data.id}
					/>
				</div>
				<div>
					<p className="whitespace-break-spaces -mt-1">{data.body}</p>
				</div>

				<div className="flex items-center">
					<Button
						variant="ghost"
						className="flex gap-1 text-muted-foreground/80 text-xs items-center rounded-2xl hover:bg-transparent! hover:text-pink-500 p-0!"
						title="Likes"
					>
						<Heart className="size-4.5" />
						<span className="tabular-nums text-left"></span>
					</Button>
					<Button
						variant="ghost"
						className="flex gap-1 text-muted-foreground/80 text-sm items-center rounded-2xl hover:bg-transparent!"
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
			</div>
		</div>
	);
};

interface DropdownMenuSubmenu {
	commentId: string;
	postId: string;
	authorId: string;
	viewerUserId: string;
}

const DropdownMenuSubmenu = ({
	commentId,
	postId,
	viewerUserId,
	authorId,
}: DropdownMenuSubmenu) => {
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
};
