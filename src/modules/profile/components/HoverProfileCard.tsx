"use client";

import Link from "next/link";
import type * as z from "zod";
import { VerifiedBadge } from "@/components/misc/VerifiedBadge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/client/utils";
import { DEFAULT_PFP_URL } from "@/lib/shared/constants";
import type { profileSchema } from "../profile.schema";

interface HoverProfileCardProps {
	className?: string;
	data: z.infer<typeof profileSchema.get.output>;
	action?: React.ReactNode;
}

const HoverProfileCard = ({
	className,
	data,
	action,
}: HoverProfileCardProps) => {
	return (
		<div className={cn("w-full p-4 flex flex-col gap-4", className)}>
			<div className="w-full">
				<div className="w-full flex justify-between">
					<Avatar className="size-15">
						<AvatarImage src={data.avatarUrl || DEFAULT_PFP_URL} />
					</Avatar>
					{action}
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
			</div>
		</div>
	);
};

export default HoverProfileCard;
