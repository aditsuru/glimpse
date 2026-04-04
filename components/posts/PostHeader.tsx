import { BadgeCheck } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials, timeAgo } from "@/lib/utils";

interface PostHeaderProps {
	authorName: string;
	authorUsername: string;
	authorAvatarUrl?: string | null;
	authorIsVerified?: boolean;
	createdAt: Date;
}

export function PostHeaderFeed({
	authorName,
	authorUsername,
	authorAvatarUrl,
	authorIsVerified,
	createdAt,
}: PostHeaderProps) {
	return (
		<div className="flex gap-3 items-start">
			<Link href={`/user/${authorUsername}`}>
				<Avatar size="lg">
					<AvatarImage src={authorAvatarUrl || ""} alt={authorName} />
					<AvatarFallback>{initials(authorName)}</AvatarFallback>
				</Avatar>
			</Link>

			<div className="flex flex-col min-w-0">
				<div className="flex items-center gap-1 flex-wrap text-sm">
					<Link
						className="font-semibold hover:underline"
						href={`/user/${authorUsername}`}
					>
						{authorName}
					</Link>
					{authorIsVerified && (
						<BadgeCheck size={20} className="text-chart-2 shrink-0" />
					)}
				</div>
				<div className="flex items-center gap-1 flex-wrap text-muted-foreground text-sm">
					<Link className="hover:underline" href={`/user/${authorUsername}`}>
						@{authorUsername}
					</Link>
					<span>·</span>
					<span>{timeAgo(createdAt)}</span>
				</div>
			</div>
		</div>
	);
}

export function PostHeaderThread({
	authorName,
	authorUsername,
	authorAvatarUrl,
	authorIsVerified,
	createdAt,
}: PostHeaderProps) {
	return (
		<div className="flex gap-3 flex-col sm:flex-row items-start">
			<Link href={`/user/${authorUsername}`}>
				<Avatar size="lg">
					<AvatarImage src={authorAvatarUrl || ""} alt={authorName} />
					<AvatarFallback>{initials(authorName)}</AvatarFallback>
				</Avatar>
			</Link>

			<div className="flex flex-col min-w-0">
				<div className="flex items-center gap-1 flex-wrap text-base">
					<Link
						className="font-semibold hover:underline"
						href={`/user/${authorUsername}`}
					>
						{authorName}
					</Link>
					{authorIsVerified && (
						<BadgeCheck size={22} className="text-chart-2 shrink-0" />
					)}
				</div>
				<div className="flex items-center gap-1 flex-wrap text-muted-foreground text-sm">
					<Link className="hover:underline" href={`/user/${authorUsername}`}>
						@{authorUsername}
					</Link>
					<span>·</span>
					<span>{timeAgo(createdAt)}</span>
				</div>
			</div>
		</div>
	);
}
