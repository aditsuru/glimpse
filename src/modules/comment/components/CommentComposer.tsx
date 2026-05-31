"use client";

import type React from "react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/client/utils";
import { DEFAULT_PFP_URL } from "@/lib/shared/constants";
import { useProfile } from "@/modules/profile/profile.queries";
import { useViewerStore } from "@/store/use-viewer-store";
import { useCreateComment, useCreateReply } from "../comment.queries";

interface CommentComposerProps {
	postId: string;
	parentCommentId?: string;
	onSuccess?: () => void;
	className?: string;
	avatarSize?: "default" | "sm" | "lg";
}

export const CommentComposer = ({
	postId,
	parentCommentId,
	onSuccess,
	className,
	avatarSize,
}: CommentComposerProps) => {
	const { userId } = useViewerStore();
	const { data: profile } = useProfile({ userId });

	const createComment = useCreateComment(postId);
	const createReply = useCreateReply({
		postId,
		commentId: parentCommentId ?? "",
	});

	const mutation = parentCommentId ? createReply : createComment;

	const [body, setBody] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const growTextarea = useCallback(() => {
		const el = textareaRef.current;
		if (!el) return;
		el.style.height = "auto";
		el.style.height = `${el.scrollHeight}px`;
	}, []);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!body.trim()) return;

		setIsLoading(true);
		mutation.mutate(
			{ body, postId, parentCommentId },
			{
				onSuccess: () => {
					toast.success("Your reply was posted.");
					setBody("");
					if (textareaRef.current) {
						textareaRef.current.style.height = "auto";
					}
					onSuccess?.();
				},
				onSettled: () => {
					setIsLoading(false);
				},
			}
		);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className={cn(
				"flex items-start gap-1",
				{
					"p-4 border-b": !parentCommentId,
					"pt-3": !!parentCommentId,
				},
				className
			)}
		>
			<Avatar
				size={avatarSize ? avatarSize : "lg"}
				className={cn({ "brightness-70": isLoading })}
			>
				<AvatarImage src={profile?.avatarUrl ?? DEFAULT_PFP_URL} />
			</Avatar>

			<label
				htmlFor={`comment-body-${parentCommentId ?? "root"}`}
				className="sr-only"
			>
				Post your reply
			</label>

			<Textarea
				id={`comment-body-${parentCommentId ?? "root"}`}
				placeholder="Post your reply"
				ref={textareaRef}
				rows={1}
				className="resize-none min-h-[20px] max-h-[180px] text-lg! border-none shadow-none focus-visible:ring-0 bg-transparent! -mt-1"
				value={body}
				onChange={(e) => {
					setBody(e.target.value);
					growTextarea();
				}}
				disabled={isLoading}
			/>
			<Button
				type="submit"
				size="sm"
				disabled={isLoading || !body.trim()}
				className="rounded-full px-5"
			>
				{isLoading ? "Replying..." : "Reply"}
			</Button>
		</form>
	);
};
