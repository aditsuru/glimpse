"use client";

import { EllipsisVertical, Flag, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/clients/auth-client";
import { config } from "@/lib/config";
import type { PostOutput } from "@/server/shared/schemas/post";
import { ImageCarousel } from "../media/ImageCarousel";
import { VideoPlayer } from "../media/VideoPlayer";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "../ui/alert-dialog";
import { AspectRatio } from "../ui/aspect-ratio";
import { Card } from "../ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { PostActions } from "./PostActions";
import { PostBody } from "./PostBody";
import { PostHeaderFeed } from "./PostHeader";

export default function PostCard(post: PostOutput) {
	const { data: session } = authClient.useSession();
	const isOwnPost = session?.user?.id === post.userId;
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	const images =
		post.attachments?.filter(
			(a) => a.fileType === "image" || a.fileType === "gif"
		) ?? [];
	const video = post.attachments?.find((a) => a.fileType === "video");

	const handleShare = async () => {
		toast.success("Link copied to clipboard!");
		await navigator.clipboard.writeText(
			`${config.NEXT_PUBLIC_APP_URL}/post/${post.id}`
		);
	};

	return (
		<>
			<Card className="w-full bg-transparent ring-0 shadow-none flex flex-col gap-3 p-4">
				<div className="flex-1 min-w-0 flex flex-col gap-1">
					{/* Top row: Header + Menu */}
					<div className="flex justify-between items-start">
						<PostHeaderFeed {...post} />

						<DropdownMenu>
							<DropdownMenuTrigger className="text-muted-foreground hover:text-foreground p-1">
								<EllipsisVertical size={18} />
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								{isOwnPost ? (
									<DropdownMenuItem
										className="text-destructive"
										onClick={() => setShowDeleteDialog(true)}
									>
										<Trash2 />
										Delete
									</DropdownMenuItem>
								) : (
									<DropdownMenuItem>
										<Flag />
										Report
									</DropdownMenuItem>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					<div
						className={
							post.hasAttachments ? "mb-2 mt-1 text-sm" : "mt-1 text-sm"
						}
					>
						{post.body && <PostBody content={post.body} />}
					</div>

					{post.hasAttachments && (
						<div className="mb-1">
							{images.length > 0 && <ImageCarousel attachments={images} />}
							{video && (
								<AspectRatio ratio={16 / 9}>
									<VideoPlayer src={video.fileUrl} autoPlay />
								</AspectRatio>
							)}
						</div>
					)}

					<PostActions
						{...post}
						className="-ml-2 mt-1"
						onShare={handleShare}
						onLike={() => {
							/* mutation here */
						}}
						onBookmark={() => {
							/* mutation here */
						}}
						onComment={() => {
							/* mutation here */
						}}
					/>
				</div>
			</Card>

			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete this post?</AlertDialogTitle>
						<AlertDialogDescription>
							This cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								/* actual delete logic */
							}}
							variant="destructive"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
