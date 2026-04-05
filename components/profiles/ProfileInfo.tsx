"use client";

import Link from "next/link";
import { Link2 as LinkIcon } from "lucide-react";
import { VerifiedBadge } from "@/components/misc/VerifiedBadge";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { formatCount } from "@/lib/utils";
import { config } from "@/lib/config";
import { ProfileUserCard } from "./ProfileUserCard";

const mockFollowers = [
	{
		name: "Jane Doe",
		username: "janedoe",
		avatarUrl: null,
		isFollowing: true,
	},
	{
		name: "Colin Hacks",
		username: "colinhacks",
		avatarUrl: null,
		isFollowing: false,
	},
	{
		name: "Theo Browne",
		username: "t3dotgg",
		avatarUrl: null,
		isFollowing: false,
	},
	{
		name: "shadcn",
		username: "shadcn",
		avatarUrl: null,
		isFollowing: true,
	},
	{
		name: "Lee Robinson",
		username: "leeerob",
		avatarUrl: null,
		isFollowing: false,
	},
];

interface ProfileInfoProps {
	name: string;
	username: string;
	bio?: string | null;
	website?: string | null;
	followersCount: number;
	followingsCount: number;
	isGlimpseVerified: boolean;
}

export function ProfileInfo({
	name,
	username,
	bio,
	website,
	followersCount,
	followingsCount,
	isGlimpseVerified,
}: ProfileInfoProps) {
	const bioLimit = Number(config.NEXT_PUBLIC_BIO_CHAR_LIMIT);
	const truncatedBio =
		bio && bio.length > bioLimit ? `${bio.slice(0, bioLimit)}…` : bio;

	return (
		<div className="px-4 pt-2 flex flex-col gap-3">
			{/* Name + badge */}
			<div className="flex flex-col gap-0.5">
				<div className="flex items-center gap-1.5">
					<p className="font-bold text-xl leading-tight">{name}</p>
					{isGlimpseVerified && <VerifiedBadge size={22} />}
				</div>
				<p className="text-sm text-muted-foreground">@{username}</p>
			</div>

			{/* Bio */}
			{truncatedBio && (
				<p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 max-h-30">
					{truncatedBio}
				</p>
			)}

			{/* Stats + website */}
			<div className="flex flex-wrap items-center gap-x-5 gap-y-2">
				<Popover>
					<PopoverTrigger className="group flex items-center gap-1 text-sm">
						<span className="font-semibold text-foreground group-hover:underline">
							{formatCount(followersCount)}
						</span>
						<span className="text-muted-foreground">Followers</span>
					</PopoverTrigger>
					<PopoverContent className="w-72 p-3" align="start">
						<div className="flex flex-col divide-y divide-border">
							{mockFollowers.map((f) => (
								<ProfileUserCard key={f.username} {...f} />
							))}
						</div>
					</PopoverContent>
				</Popover>

				<Popover>
					<PopoverTrigger className="group flex items-center gap-1 text-sm">
						<span className="font-semibold text-foreground group-hover:underline">
							{formatCount(followingsCount)}
						</span>
						<span className="text-muted-foreground">Following</span>
					</PopoverTrigger>
					<PopoverContent className="w-80" align="start">
						{/* TODO: following list */}
					</PopoverContent>
				</Popover>

				{website && (
					<Link
						href={website}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1 text-sm text-chart-2 hover:underline"
					>
						<LinkIcon size={16} className="shrink-0 text-muted-foreground" />
						{website.replace(/^https?:\/\//, "")}
					</Link>
				)}
			</div>
		</div>
	);
}
