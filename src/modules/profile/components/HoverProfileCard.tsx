"use client";

import { ORPCError } from "@orpc/client";
import { Ghost } from "lucide-react";
import Link from "next/link";
import { VerifiedBadge } from "@/components/misc/VerifiedBadge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/client/auth-client";
import { cn } from "@/lib/client/utils";
import { DEFAULT_PFP_URL } from "@/lib/shared/constants";
import FollowButton from "@/modules/follow/components/FollowButton";
import { useProfile } from "../profile.queries";
import { ProfileError } from "./Profile";

interface HoverProfileCardProps {
	className?: string;
	username: string;
}

const HoverProfileCard = ({ className, username }: HoverProfileCardProps) => {
	const { data, isLoading, error } = useProfile({ username });
	const { data: sessionData } = authClient.useSession();
	if (error) {
		if (error instanceof ORPCError && error.code === "NOT_FOUND") {
			return <ProfileError />;
		}
		return <HoverProfileError />;
	}

	if (isLoading || !data) return <HoverProfileCardSkeleton />;

	return (
		<div className={cn("w-full p-4 flex flex-col gap-4", className)}>
			<div className="w-full">
				<div className="w-full flex justify-between">
					<Avatar className="size-15">
						<AvatarImage src={data.avatarUrl || DEFAULT_PFP_URL} />
					</Avatar>
					{data.userId !== sessionData?.user.id && (
						<FollowButton
							initialStatus={data.viewerStatus}
							targetUserId={data.userId}
							targetVisibility={data.visibility}
						/>
					)}
				</div>
				<Link href={`/${data.username}`}>
					<p className="text-xl font-semibold mt-2 flex gap-1 items-center hover:underline hover:underline-offset-4">
						{data.displayName}
						{data.isGlimpseVerified && <VerifiedBadge />}
					</p>
				</Link>
				<div className="text-muted-foreground flex gap-1 text-sm">
					@{data.username}
					{data.pronouns && <p>~ {data.pronouns}</p>}
				</div>
			</div>
			<div>
				<p className="line-clamp-4 text-base whitespace-pre-wrap">{data.bio}</p>
				<div className="mt-4 flex gap-4 font-semibold">
					<Link href={`/${data.username}/followers`}>
						<p className="hover:underline hover:underline-offset-4">
							{data.followersCount}{" "}
							<span className="text-muted-foreground font-medium">
								Followers
							</span>
						</p>
					</Link>
					<Link href={`/${data.username}/following`}>
						<p className="hover:underline hover:underline-offset-4">
							{data.followingCount}{" "}
							<span className="text-muted-foreground font-medium">
								Following
							</span>
						</p>
					</Link>
				</div>
			</div>
		</div>
	);
};

const HoverProfileCardSkeleton = ({ className }: { className?: string }) => {
	return (
		<div className={cn("w-full p-4 flex flex-col gap-4", className)}>
			<div className="w-full">
				<div className="w-full flex justify-between">
					<Skeleton className="size-15 rounded-full" />
					<Skeleton className="h-9 w-24 rounded-full" />
				</div>
				<Skeleton className="h-6 w-32 rounded mt-2" />
				<Skeleton className="h-4 w-24 rounded mt-1" />
			</div>
			<div className="flex flex-col gap-2">
				<Skeleton className="h-4 w-full rounded" />
				<Skeleton className="h-4 w-3/4 rounded" />
				<div className="mt-2 flex gap-4">
					<Skeleton className="h-4 w-20 rounded" />
					<Skeleton className="h-4 w-20 rounded" />
				</div>
			</div>
		</div>
	);
};

const HoverProfileError = () => {
	return (
		<div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
			<Ghost className="size-12" />
			<p className="text-lg font-semibold text-foreground">
				This account doesn't exist
			</p>
			<p className="text-sm">Try searching for another.</p>
		</div>
	);
};

export default HoverProfileCard;
