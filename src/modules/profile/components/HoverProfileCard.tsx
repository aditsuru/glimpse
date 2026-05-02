"use client";

import Link from "next/link";
import type * as z from "zod";
import { VerifiedBadge } from "@/components/misc/VerifiedBadge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/client/utils";
import { DEFAULT_PFP_URL } from "@/lib/shared/constants";
import type { profileSchema } from "../profile.schema";

interface HoverProfileCardProps {
	className?: string;
	data: z.infer<typeof profileSchema.get.output>;
	handleFollow: () => void;
}
const HoverProfileCard = ({
	className,
	data,
	handleFollow,
}: HoverProfileCardProps) => {
	return (
		<Card className={cn("w-80", className)}>
			<CardHeader>
				<div className="w-full flex justify-between">
					<Avatar className="size-15">
						<AvatarImage src={data.avatarUrl || DEFAULT_PFP_URL} />
					</Avatar>
					<Button variant="outline-ring" onClick={handleFollow}>
						Follow
					</Button>
				</div>
				<Link href={`/${data.username}`}>
					<CardTitle className="text-xl font-semibold mt-2 flex gap-1 items-center hover:underline hover:underline-offset-4">
						{data.displayName}
						{data.isGlimpseVerified && <VerifiedBadge />}
					</CardTitle>
				</Link>
				<CardDescription className="text-muted-foreground flex gap-1">
					@{data.username}
					{data.pronouns && <p>~ {data.pronouns}</p>}
				</CardDescription>
			</CardHeader>
			<CardContent className="-mt-4">
				<p className="line-clamp-4 text-base whitespace-pre-wrap">{data.bio}</p>
				<div className="mt-4 flex gap-4 font-sm font-semibold">
					<Link href={`/${data.username}/followers`}>
						<p className="hover:underline hover:underline-offset-4">
							12{" "}
							<span className="text-muted-foreground font-medium">
								Followers
							</span>
						</p>
					</Link>
					<Link href={`/${data.username}/following`}>
						<p className="hover:underline hover:underline-offset-4">
							12{" "}
							<span className="text-muted-foreground font-medium">
								Following
							</span>
						</p>
					</Link>
				</div>
			</CardContent>
		</Card>
	);
};

const HoverProfileCardSkeleton = ({ className }: { className?: string }) => {
	return (
		<Card className={cn("w-80", className)}>
			<CardHeader>
				<div className="w-full flex justify-between">
					<Skeleton className="size-15 rounded-full" />
					<Skeleton className="h-10 w-20 rounded-full" />
				</div>
				<Skeleton className="h-5 w-32 rounded mt-2" />
				<Skeleton className="h-4 w-24 rounded" />
			</CardHeader>
			<CardContent className="-mt-4 flex flex-col gap-2">
				<Skeleton className="h-4 w-full rounded" />
				<Skeleton className="h-4 w-full rounded" />
				<Skeleton className="h-4 w-2/3 rounded" />
				<div className="mt-4 flex gap-4">
					<Skeleton className="h-4 w-20 rounded" />
					<Skeleton className="h-4 w-20 rounded" />
				</div>
			</CardContent>
		</Card>
	);
};

export { HoverProfileCard, HoverProfileCardSkeleton };
