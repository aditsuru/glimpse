/** biome-ignore-all lint/a11y/useSemanticElements: div is needed to be interactive */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: these divs are not interactive */
"use client";

import { Ellipsis, MessageCircle, Share } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { formatPostDate, startProgress } from "@/lib/client/helpers";
import { cn } from "@/lib/client/utils";
import { config } from "@/lib/shared/config";
import { DEFAULT_PFP_URL } from "@/lib/shared/constants";
import { CommentLikeButton } from "@/modules/comment-like/components/CommentLikeButton";
import { HoverProfileCard } from "@/modules/profile/components/HoverProfileCard";
import { useConfirmDialogStore } from "@/store/use-confirm-dialog-store";
import { useViewerStore } from "@/store/use-viewer-store";
import { useDeleteComment, useGetCommentReplies } from "../comment.queries";
import type { getCommentOutput } from "../comment.schema";
import { CommentComposer } from "./CommentComposer";

interface CommentCardProps {
	data: z.infer<typeof getCommentOutput>;
	isNested?: boolean;
	isLast?: boolean;
	redirect?: string;
	hideToolbar?: boolean;
	hideNestedReplies?: boolean;
	hideConnectors?: boolean;
	forceConnector?: boolean;
	pfpSize?: "lg" | "sm" | "default";
}

export const CommentCard = ({
	data,
	isNested = false,
	redirect,
	hideToolbar = false,
	isLast = false,
	hideNestedReplies = false,
	hideConnectors = false,
	forceConnector = false,
	pfpSize,
}: CommentCardProps) => {
	const [repliesOpen, setRepliesOpen] = useState(false);
	const [replyComposerOpen, setReplyComposerOpen] = useState(false);
	const router = useRouter();

	const {
		data: repliesData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
	} = useGetCommentReplies(data.id, repliesOpen);

	const replies = repliesData?.pages.flatMap((p) => p.items) ?? [];
	const remainingCount = Math.max(0, data.repliesCount - replies.length);

	const showConnector =
		forceConnector ||
		(!hideConnectors &&
			!isLast &&
			(isNested || (repliesOpen && replies.length > 0 && !replyComposerOpen)));

	return (
		<div
			className={isNested ? "w-full pr-4" : "w-full py-2 px-4"}
			onClick={() => {
				if (!redirect) return;
				startProgress();
				router.push(`/p/${data.postId}?highlight=${redirect}`);
			}}
			onKeyDown={(e) => {
				if (e.key === "Enter") {
					if (!redirect) return;
					startProgress();
					router.push(`/p/${data.postId}?highlight=${redirect}`);
				}
			}}
		>
			<div className="flex gap-3 items-start">
				<div className="flex flex-col items-center self-stretch shrink-0">
					<Avatar className="shrink-0" size={pfpSize}>
						<AvatarImage src={data.author.avatarUrl ?? DEFAULT_PFP_URL} />
					</Avatar>

					{showConnector && <div className="flex-1 w-px bg-ring" />}
				</div>

				<div className="flex-1 flex flex-col min-w-0">
					{/* Header */}
					<div className="text-base font-semibold flex justify-between gap-2 items-center -mt-1 translate-y-[-2px]">
						<div
							className="flex gap-1 items-center"
							onClick={(e) => e.stopPropagation()}
							onKeyDown={(e) => e.stopPropagation()}
						>
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
							postId={data.postId}
							authorId={data.author.id}
							commentId={data.id}
						/>
					</div>

					{/* Body */}
					<p className="whitespace-break-spaces -mt-1">{data.body}</p>

					{/* Action bar */}
					<div
						className="flex items-center gap-4 mt-1 pb-2"
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => e.stopPropagation()}
					>
						<CommentLikeButton
							commentId={data.id}
							initialCount={data.likesCount}
							initialState={data.isLikedByUser}
						/>
						{!isNested && !hideToolbar && !hideNestedReplies && (
							<Button
								variant="ghost"
								className="flex gap-1 text-muted-foreground/80 items-center rounded-2xl hover:bg-transparent! hover:text-green-500 px-0!"
								title="Reply"
								onClick={() => setReplyComposerOpen((prev) => !prev)}
							>
								<MessageCircle className="size-4.5 transition-transform active:scale-125" />

								<span className="tabular-nums min-w-4 text-left">Reply</span>
							</Button>
						)}
						{!isNested && !hideToolbar && (
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
						)}
					</div>
				</div>
			</div>
			{/* Inline reply composer */}
			{!isNested && !hideToolbar && !hideNestedReplies && replyComposerOpen && (
				<CommentComposer
					postId={data.postId}
					parentCommentId={data.id}
					onSuccess={() => {
						setReplyComposerOpen(false);
						setRepliesOpen(true);
					}}
					className="pb-8"
				/>
			)}
			{/* Replies */}
			{!isNested &&
				!hideToolbar &&
				!hideNestedReplies &&
				data.repliesCount > 0 && (
					<div className="ml-1">
						{!repliesOpen ? (
							<Button
								variant="ghost"
								className="flex gap-1 text-muted-foreground text-sm items-center rounded-2xl hover:bg-transparent! px-0! w-fit hover:text-muted-foreground/80"
								onClick={() => setRepliesOpen(true)}
							>
								Show {data.repliesCount}{" "}
								{data.repliesCount === 1 ? "reply" : "replies"}
							</Button>
						) : (
							<>
								<div>
									{replies.map((reply, index) => (
										<CommentCard
											key={reply.id}
											data={reply}
											isNested={true}
											isLast={index === replies.length - 1}
										/>
									))}
								</div>

								<div className="flex gap-4 items-baseline">
									{hasNextPage && (
										<Button
											variant="ghost"
											className="flex gap-1 text-muted-foreground text-sm items-center rounded-2xl hover:bg-transparent! px-0! w-fit hover:text-muted-foreground/80"
											onClick={() => fetchNextPage()}
											disabled={isFetchingNextPage}
										>
											{isFetchingNextPage
												? "Loading..."
												: `Show ${remainingCount} more ${remainingCount === 1 ? "reply" : "replies"}`}
										</Button>
									)}

									<Button
										variant="ghost"
										className={cn(
											"flex gap-1 text-muted-foreground text-sm items-center rounded-2xl hover:bg-transparent! px-0! w-fit hover:text-muted-foreground/80",
											{
												"pointer-events-none": isLoading,
											}
										)}
										onClick={() => setRepliesOpen(false)}
									>
										{isLoading ? "Loading..." : "Hide replies"}
									</Button>
								</div>
							</>
						)}
					</div>
				)}
		</div>
	);
};

interface DropdownMenuSubmenuProps {
	commentId: string;
	postId: string;
	authorId: string;
}

const DropdownMenuSubmenu = ({
	commentId,
	postId,
	authorId,
}: DropdownMenuSubmenuProps) => {
	const { userId } = useViewerStore();
	const deleteComment = useDeleteComment({ postId });

	const openConfirmDialog = useConfirmDialogStore((state) => state.openDialog);

	const handleDelete = () => {
		openConfirmDialog({
			title: "Delete Comment?",
			description: "This can't be undone.",
			confirmText: "Delete",
			confirmVariant: "destructive",
			className: "sm:max-w-md",
			onConfirm: () => {
				deleteComment.mutate({ commentId });

				toast.success("Comment was deleted.");
			},
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						variant="ghost"
						className="flex gap-1 text-muted-foreground text-sm items-center rounded-2xl hover:bg-transparent! aria-expanded:bg-transparent! px-0!"
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => e.stopPropagation()}
					>
						<Ellipsis className="size-4.5" />
					</Button>
				}
			/>
			<DropdownMenuContent className="w-auto">
				<DropdownMenuGroup>
					{authorId === userId && (
						<DropdownMenuItem
							onClick={(e) => {
								handleDelete();
								e.stopPropagation();
							}}
							className="text-destructive hover:text-destructive!"
						>
							Delete
						</DropdownMenuItem>
					)}
					{authorId !== userId && (
						<DropdownMenuItem className="text-destructive hover:text-destructive!">
							Report
						</DropdownMenuItem>
					)}
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
