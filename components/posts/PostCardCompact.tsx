/** biome-ignore-all lint/a11y/noStaticElementInteractions: none */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: none */
"use client";

import { Bookmark, Heart, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { extractPostText } from "@/lib/post/extractPostText";
import { initials, timeAgo } from "@/lib/utils";
import type { PostOutput } from "@/server/shared/schemas/post";
import { VerifiedBadge } from "../misc/VerifiedBadge";
import { CompactPostMedia } from "./CompactPostMedia";

const COMPACT_CHAR_LIMIT = 180;

function formatCount(n: number) {
	if (n < 1000) return n.toString();
	if (n < 1000000) return `${(n / 1000).toFixed(1)}k`;
	return `${(n / 1000000).toFixed(1)}m`;
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

	const images =
		attachments?.filter(
			(a) => a.fileType === "image" || a.fileType === "gif"
		) ?? [];
	const video = attachments?.find((a) => a.fileType === "video");
	const hasMedia = images.length > 0 || !!video;

	return (
		<div
			onClick={() => router.push(`/post/${id}`)}
			onKeyDown={(e) => {
				if (e.key === "Enter") router.push(`/post/${id}`);
			}}
			className="flex gap-3 py-3 px-2 hover:bg-muted/40 transition-colors w-full"
		>
			{/* Avatar — stopPropagation so clicking it goes to profile, not post */}
			<Link
				href={`/user/${authorUsername}`}
				onClick={(e) => e.stopPropagation()}
				className="shrink-0"
			>
				<Avatar size="default">
					<AvatarImage src={authorAvatarUrl ?? ""} alt={authorName} />
					<AvatarFallback>{initials(authorName)}</AvatarFallback>
				</Avatar>
			</Link>

			{/* Content column */}
			<div className="flex flex-col gap-1.5 min-w-0 flex-1">
				{/* Author row */}
				<div className="flex items-center gap-1 text-sm flex-wrap">
					<Link
						href={`/user/${authorUsername}`}
						onClick={(e) => e.stopPropagation()}
						className="font-semibold hover:underline"
					>
						{authorName}
					</Link>
					{authorIsVerified && <VerifiedBadge size={14} />}
					<Link
						href={`/user/${authorUsername}`}
						onClick={(e) => e.stopPropagation()}
						className="text-muted-foreground hover:underline"
					>
						@{authorUsername}
					</Link>
					<span className="text-muted-foreground">·</span>
					<span className="text-muted-foreground">{timeAgo(createdAt)}</span>
				</div>

				{/* Body */}
				{rawText && (
					<p className="text-sm leading-relaxed text-foreground/90">
						{displayText}
						{needsTruncation && (
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									setExpanded((v) => !v);
								}}
								className="ml-1 text-primary hover:underline text-sm"
							>
								{expanded ? "less" : "more"}
							</button>
						)}
					</p>
				)}

				{/* Media */}
				{hasAttachments && hasMedia && (
					<div onClick={(e) => e.stopPropagation()}>
						<CompactPostMedia attachments={attachments ?? []} />
					</div>
				)}

				{/* Counts */}

				<Link
					href={`/user/${authorUsername}`}
					onClick={(e) => e.stopPropagation()}
					className="flex items-center gap-4 text-xs text-muted-foreground mt-0.5"
				>
					<span className="flex items-center gap-1">
						<Heart
							size={13}
							className={
								hasUserLiked ? "fill-destructive text-destructive" : ""
							}
						/>
						{formatCount(likes)}
					</span>
					<span className="flex items-center gap-1">
						<MessageCircle size={13} />
						{formatCount(comments)}
					</span>
					<span className="flex items-center gap-1">
						<Bookmark
							size={13}
							className={
								hasUserBookmarked ? "fill-foreground text-foreground" : ""
							}
						/>
						{formatCount(bookmarks)}
					</span>
				</Link>
			</div>
		</div>
	);
}
