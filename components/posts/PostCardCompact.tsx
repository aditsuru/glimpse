/** biome-ignore-all lint/a11y/noStaticElementInteractions: none */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: none */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { extractPostText } from "@/lib/post/extractPostText";
import { initials, timeAgo } from "@/lib/utils";
import type { PostOutput } from "@/server/shared/schemas/post";
import { VerifiedBadge } from "../misc/VerifiedBadge";
import { CompactPostMedia } from "./CompactPostMedia";
import { PostActions } from "./PostActions";

const COMPACT_CHAR_LIMIT = 180;

function stopProp(e: React.MouseEvent) {
	e.stopPropagation();
}

export function PostCardCompact({
	id,
	body,
	attachments,
	hasAttachments,
	hasUserLiked,
	hasUserBookmarked,
	likes,
	comments,
	bookmarks,
	views,
	createdAt,
	authorName,
	authorUsername,
	authorAvatarUrl,
	authorIsVerified,
}: PostOutput) {
	const router = useRouter();
	const rawText = body ? extractPostText(body) : "";
	const [expanded, setExpanded] = useState(false);

	const needsTruncation = rawText.length > COMPACT_CHAR_LIMIT;
	const displayText =
		expanded || !needsTruncation
			? rawText
			: `${rawText.slice(0, COMPACT_CHAR_LIMIT).trimEnd()}…`;

	return (
		<div
			onClick={() => router.push(`/post/${id}`)}
			onKeyDown={(e) => e.key === "Enter" && router.push(`/post/${id}`)}
			className="flex gap-3 py-3 px-2 hover:bg-muted/40 transition-colors w-full"
		>
			<Link
				href={`/user/${authorUsername}`}
				onClick={stopProp}
				className="shrink-0"
			>
				<Avatar size="default">
					<AvatarImage src={authorAvatarUrl ?? ""} alt={authorName} />
					<AvatarFallback>{initials(authorName)}</AvatarFallback>
				</Avatar>
			</Link>

			<div className="flex flex-col gap-1.5 min-w-0 flex-1">
				{/* Author row — one stopProp for the whole row */}
				<div
					className="flex items-center gap-1 text-sm flex-wrap"
					onClick={stopProp}
				>
					<Link
						href={`/user/${authorUsername}`}
						className="font-semibold hover:underline"
					>
						{authorName}
					</Link>
					{authorIsVerified && <VerifiedBadge size={14} />}
					<Link
						href={`/user/${authorUsername}`}
						className="text-muted-foreground hover:underline"
					>
						@{authorUsername}
					</Link>
					<span className="text-muted-foreground">·</span>
					<span className="text-muted-foreground">{timeAgo(createdAt)}</span>
				</div>

				{rawText && (
					<p className="text-sm leading-relaxed text-foreground/90">
						{displayText}
						{needsTruncation && (
							<button
								type="button"
								onClick={(e) => {
									stopProp(e);
									setExpanded((v) => !v);
								}}
								className="ml-1 text-primary hover:underline text-sm"
							>
								{expanded ? "less" : "more"}
							</button>
						)}
					</p>
				)}

				{hasAttachments && !!attachments?.length && (
					<div onClick={stopProp}>
						<CompactPostMedia attachments={attachments} />
					</div>
				)}

				<div onClick={stopProp}>
					<PostActions
						likes={likes}
						comments={comments}
						bookmarks={bookmarks}
						views={views}
						hasUserLiked={hasUserLiked}
						hasUserBookmarked={hasUserBookmarked}
						className="-ml-2 mt-0.5"
					/>
				</div>
			</div>
		</div>
	);
}
