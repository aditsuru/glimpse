import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";

interface ProfileUserCardProps {
	name: string;
	username: string;
	avatarUrl?: string | null;
	isFollowing?: boolean;
}

export function ProfileUserCard({
	name,
	username,
	avatarUrl,
	isFollowing = false,
}: ProfileUserCardProps) {
	return (
		<div className="flex items-center justify-between gap-3 py-2">
			<Link
				href={`/user/${username}`}
				className="flex items-center gap-2.5 min-w-0 group"
			>
				<Avatar size="lg">
					<AvatarImage src={avatarUrl ?? ""} alt={name} />
					<AvatarFallback>{initials(name)}</AvatarFallback>
				</Avatar>
				<div className="flex flex-col min-w-0">
					<span className="text-sm font-semibold leading-tight truncate hover:underline">
						{name}
					</span>
					<span className="text-xs text-muted-foreground truncate hover:underline">
						@{username}
					</span>
				</div>
			</Link>

			<Button
				variant={isFollowing ? "outline" : "default"}
				size="sm"
				className="shrink-0"
			>
				{isFollowing ? "Following" : "Follow"}
			</Button>
		</div>
	);
}
