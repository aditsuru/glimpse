"use client";

import Image from "next/image";
import Link from "next/link";
import type * as z from "zod";
import { VerifiedBadge } from "@/components/misc/VerifiedBadge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_PFP_URL, isGif } from "@/lib/shared/constants";
import { FollowButton } from "@/modules/follow/components/FollowButton";
import type { profileSchema } from "../profile.schema";

interface ProfileProps {
	data: z.infer<typeof profileSchema.get.output>;
	viewerUserId: string;
}

export const Profile = ({ data, viewerUserId }: ProfileProps) => {
	return (
		<div className="w-full">
			<div className="relative">
				<AspectRatio ratio={3 / 1} className="overflow-hidden bg-accent">
					{!!data.bannerUrl && (
						<Image
							src={data.bannerUrl}
							alt="banner"
							fill
							unoptimized={isGif(data.bannerMimeType ?? "")}
							className="object-cover object-center"
							priority
						/>
					)}
				</AspectRatio>
				<div className="px-4">
					<Avatar className="absolute -translate-y-1/2 size-30 ring-4 ring-background">
						<AvatarImage src={data.avatarUrl ?? DEFAULT_PFP_URL} />
					</Avatar>
				</div>
				{viewerUserId === data.userId && (
					<Button
						variant="outline-ring"
						nativeButton={false}
						render={<Link href="/settings/profile" />}
						className="absolute right-4 translate-y-1/2 active:not-aria-[haspopup]:translate-y-5!"
					>
						Edit Profile
					</Button>
				)}
				{viewerUserId !== data.userId && (
					<FollowButton
						targetUserId={data.userId}
						targetUsername={data.username}
						targetVisibility={data.visibility}
						className="absolute right-4 translate-y-1/2 active:not-aria-[haspopup]:translate-y-5!"
					/>
				)}
			</div>
			<div className="mt-[80px] px-4">
				<h2 className="text-2xl font-semibold flex gap-1 items-center">
					{data.displayName}
					{data.isGlimpseVerified && <VerifiedBadge className="size-6" />}
				</h2>
				<div className="flex items-center gap-1 text-muted-foreground">
					<h3>@{data.username}</h3>
					{data.pronouns && <p>~ {data.pronouns}</p>}
				</div>
				{data.bio && (
					<div className="mt-4">
						<p className="line-clamp-5 whitespace-pre-wrap">{data.bio}</p>
					</div>
				)}
				<div className="mt-4 flex gap-4 font-sm font-semibold">
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

export const ProfileSkeleton = () => {
	return (
		<div className="w-full">
			<div className="relative">
				<AspectRatio ratio={3 / 1}>
					<Skeleton className="w-full h-full mt-18" />
				</AspectRatio>
				<div className="px-4">
					<Skeleton className="absolute -translate-y-1/2 size-30 rounded-full ring-4 ring-background" />
				</div>
			</div>
			<div className="mt-[80px] px-4 flex flex-col gap-3">
				<Skeleton className="h-7 w-40 rounded" />
				<Skeleton className="h-4 w-28 rounded" />
				<Skeleton className="h-4 w-full rounded" />
				<Skeleton className="h-4 w-3/4 rounded" />
				<div className="flex gap-4 mt-1">
					<Skeleton className="h-4 w-20 rounded" />
					<Skeleton className="h-4 w-20 rounded" />
				</div>
			</div>
		</div>
	);
};
