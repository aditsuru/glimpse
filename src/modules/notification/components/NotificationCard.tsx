/** biome-ignore-all lint/a11y/useSemanticElements: none */

"use client";

import {
	Heart,
	Megaphone,
	MessageCircle,
	UserCheck,
	UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import type * as z from "zod";
import { VerifiedBadge } from "@/components/misc/VerifiedBadge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import { formatPostDate } from "@/lib/client/helpers";
import { cn } from "@/lib/client/utils";
import { DEFAULT_PFP_URL, isVideo } from "@/lib/shared/constants";
import { HoverProfileCard } from "@/modules/profile/components/HoverProfileCard";
import type { notificationSchema } from "../notification.schema";

type NotificationItem = z.infer<
	typeof notificationSchema.getAll.output
>["items"][number];

type Actor = NotificationItem extends { actors: Array<infer A> } ? A : never;

interface NotificationCardProps {
	data: NotificationItem;
	onVisible?: () => void;
}

const ICON_MAP = {
	like: { icon: Heart, className: "text-[#f91e7f] fill-[#f91e7f]" },
	comment: { icon: MessageCircle, className: "text-green-500" },
	comment_like: { icon: Heart, className: "text-[#f91e7f] fill-[#f91e7f]" },
	reply: { icon: MessageCircle, className: "text-green-500" },
	follow: { icon: UserPlus, className: "text-primary" },
	follow_accept: { icon: UserCheck, className: "text-primary" },
	system: { icon: Megaphone, className: "text-yellow-300" },
} as const;

export const NotificationCard = ({
	data,
	onVisible,
}: NotificationCardProps) => {
	const router = useRouter();
	const { icon: Icon, className: iconClassName } = ICON_MAP[data.type];
	const cardRef = useRef<HTMLDivElement>(null);

	const hasNotified = useRef(false);

	useEffect(() => {
		if (!onVisible || data.read || hasNotified.current) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !hasNotified.current) {
					hasNotified.current = true;
					onVisible();
					observer.disconnect();
				}
			},
			{ threshold: 0.5 }
		);
		if (cardRef.current) observer.observe(cardRef.current);
		return () => observer.disconnect();
	}, [onVisible, data.read]);

	const handleActorClick = (e: React.MouseEvent, username: string) => {
		e.stopPropagation();
		router.push(`/${username}`);
	};

	const handleCardClick = () => {
		switch (data.type) {
			case "like":
				router.push(`/p/${data.postId}`);
				break;
			case "comment":
				router.push(`/p/${data.postId}?highlight=${data.commentId}`);
				break;
			case "comment_like":
				router.push(
					data.parentCommentId
						? `/p/${data.postId}?highlight=${data.parentCommentId}`
						: `/p/${data.postId}?highlight=${data.commentId}`
				);
				break;
			case "follow":
			case "follow_accept":
				if (data.actors[0]) router.push(`/${data.actors[0].username}`);
				break;
			case "reply":
				router.push(
					data.parentCommentId
						? `/p/${data.postId}?highlight=${data.parentCommentId}`
						: `/p/${data.postId}`
				);
				break;
			default:
				break;
		}
	};

	const renderText = () => {
		if (data.type === "system") return null;

		const remainder = data.actorCount - 1;

		const actorName = <ActorName actor={data.actors[0]} />;

		const othersText = remainder > 0 && (
			<span className="text-muted-foreground">
				and {remainder} other{remainder !== 1 ? "s" : ""}{" "}
			</span>
		);

		const suffixMap: Record<string, string> = {
			like: "liked your post",
			comment: "commented on your post",
			comment_like: "liked your reply",
			follow: "followed you",
			follow_accept: "accepted your follow request",
			reply: "replied to your comment",
		};

		return (
			<span>
				{actorName} {othersText}
				<span className="text-muted-foreground">{suffixMap[data.type]}</span>
				<span className="text-muted-foreground text-sm ml-1.5">
					· {formatPostDate(data.updatedAt)}
				</span>
			</span>
		);
	};

	const renderThumbnail = () => {
		if (
			data.type !== "like" &&
			data.type !== "comment" &&
			data.type !== "reply"
		)
			return null;
		const { attachment } = data.post;
		if (!attachment) return null;
		return <MediaThumbnail attachment={attachment} />;
	};

	const renderInlinePostText = () => {
		if (data.type !== "like") return null;
		if (data.post.attachment) return null;
		if (!data.post.body) return null;

		return (
			<p className="text-base text-muted-foreground mt-1 line-clamp-2">
				{data.post.body}
			</p>
		);
	};

	const renderCommentBody = () => {
		if (data.type !== "comment" && data.type !== "reply") return null;
		if (!data.body) return null;
		return (
			<p className="text-base text-muted-foreground mt-1 line-clamp-2">
				{data.body}
			</p>
		);
	};

	return (
		<div
			ref={cardRef}
			role="button"
			tabIndex={0}
			onClick={handleCardClick}
			onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
			className={cn(
				"flex gap-4 px-4 py-4 border-b border-accent transition-colors hover:bg-accent/15 cursor-pointer",
				!data.read && "bg-primary/15"
			)}
		>
			<div className="pt-0.5 shrink-0">
				<Icon className={cn("size-7", iconClassName)} />
			</div>

			<div className="flex-1 min-w-0">
				<div className="flex items-start justify-between gap-4">
					<div>
						{/* Avatars */}
						{data.type !== "system" && data.actors.length > 0 && (
							<div className="flex items-center gap-1 mb-2 flex-wrap">
								{data.actors.map((actor) => (
									<button
										key={actor.userId}
										type="button"
										onClick={(e) => handleActorClick(e, actor.username)}
										className="rounded-full focus-visible:ring-2 focus-visible:ring-ring"
									>
										<Avatar
											size="lg"
											className="hover:opacity-80 transition-opacity"
										>
											<AvatarImage src={actor.avatarUrl || DEFAULT_PFP_URL} />
										</Avatar>
									</button>
								))}
							</div>
						)}
						{/* Message row */}
						<div className="flex-1 min-w-0">
							{data.type === "system" ? (
								<>
									<p className="text-base leading-snug">{data.body}</p>
									<p className="text-muted-foreground text-sm mt-0.5">
										{formatPostDate(data.updatedAt)}
									</p>
								</>
							) : (
								<>
									<p className="text-base leading-snug">{renderText()}</p>
									{renderInlinePostText()}
									{renderCommentBody()}
								</>
							)}
						</div>
					</div>
					{renderThumbnail()}
				</div>
			</div>
		</div>
	);
};

interface ActorNameProps {
	actor: Actor;
}

const ActorName = ({ actor }: ActorNameProps) => {
	if (!actor) return <span>Someone</span>;
	return (
		<span className="font-semibold hover:underline underline-offset-4 focus-visible:outline-none">
			<HoverCard>
				<HoverCardTrigger
					delay={300}
					onClick={(e) => e.stopPropagation()}
					render={
						<Link href={`/${actor.username}`}>
							<span className="hover:underline hover:underline-offset-4">
								{actor.displayName}
							</span>
						</Link>
					}
				/>
				<HoverCardContent className="w-xs rounded-xl bg-background">
					<HoverProfileCard username={actor.username} />
				</HoverCardContent>
			</HoverCard>
			{actor.isGlimpseVerified && (
				<VerifiedBadge className="size-3.5 inline-block ml-0.5 -translate-y-px" />
			)}
		</span>
	);
};

interface MediaThumbnailProps {
	attachment: { mimeType: string; url: string };
}

const MediaThumbnail = ({ attachment }: MediaThumbnailProps) => {
	const isVideoAttachment = isVideo(attachment.mimeType);

	return (
		<AspectRatio
			ratio={1}
			className="size-24 rounded-sm overflow-hidden bg-accent border flex items-center justify-center"
		>
			{isVideoAttachment ? (
				<video
					src={attachment.url}
					className="size-full object-cover"
					muted
					playsInline
					preload="metadata"
				/>
			) : (
				// biome-ignore lint/performance/noImgElement: thumbnail only
				<img
					src={attachment.url}
					alt="post preview"
					className="size-full object-cover"
				/>
			)}
		</AspectRatio>
	);
};
