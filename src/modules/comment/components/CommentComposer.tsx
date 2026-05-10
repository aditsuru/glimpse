"use client";

import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/client/utils";
import { DEFAULT_PFP_URL } from "@/lib/shared/constants";
import { useProfile } from "@/modules/profile/profile.queries";
import { useCreateComment } from "../comment.queries";

interface CommentComposerProps {
	viewerUserId: string;
	postId: string;
}

const CommentComposer = ({ viewerUserId, postId }: CommentComposerProps) => {
	const { data: profile } = useProfile({ userId: viewerUserId });
	const createComment = useCreateComment(postId);

	const [body, setBody] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = (e: React.SubmitEvent) => {
		e.preventDefault();

		if (!body.trim()) return;

		setIsLoading(true);
		createComment.mutate({
			body,
			postId,
		});

		toast.success("Your reply was made successfully.");
		setBody("");
		setIsLoading(false);
	};

	return (
		<div>
			<form
				onSubmit={handleSubmit}
				className="flex items-start p-4 border-b gap-1"
			>
				<Avatar
					size="lg"
					className={cn({
						"brightness-70": isLoading,
					})}
				>
					<AvatarImage src={profile?.avatarUrl ?? DEFAULT_PFP_URL} />
				</Avatar>

				<label htmlFor="comment-body" className="sr-only">
					Comment content
				</label>

				<Textarea
					id="comment-body"
					placeholder="Post your reply"
					className={
						"resize-none min-h-[20px] max-h-40 overflow-y-auto text-lg! border-none shadow-none focus-visible:ring-0 bg-transparent! -mt-1"
					}
					value={body}
					onChange={(e) => {
						setBody(e.target.value);
					}}
					disabled={isLoading}
				/>
				<Button
					type="submit"
					size="sm"
					disabled={isLoading}
					className="rounded-full px-5"
				>
					{isLoading ? "Replying..." : "Reply"}
				</Button>
			</form>
		</div>
	);
};

export default CommentComposer;
