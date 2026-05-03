import type * as z from "zod";
import { VerifiedBadge } from "@/components/misc/VerifiedBadge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/client/utils";
import { DEFAULT_PFP_URL } from "@/lib/shared/constants";
import type { profileSchema } from "../profile.schema";
import HoverProfileCard from "./HoverProfileCard";

interface ProfileCardProps {
	className?: string;
	data: Omit<
		z.infer<typeof profileSchema.get.output>,
		"followersCount" | "followingCount"
	>;
	action?: React.ReactNode;
}

const ProfileCard = ({ data, className, action }: ProfileCardProps) => {
	return (
		<div className={cn("w-full", className)}>
			<div className="w-full flex justify-between items-center p-4">
				<div className="flex gap-4 items-start">
					<Avatar className="size-12">
						<AvatarImage src={data.avatarUrl || DEFAULT_PFP_URL} />
					</Avatar>
					<div>
						<div className="text-lg font-semibold flex gap-1 items-center">
							<HoverCard>
								<HoverCardTrigger
									delay={10}
									render={
										<p className="hover:underline hover:underline-offset-4">
											{data.displayName}
										</p>
									}
								/>
								<HoverCardContent className="w-xs rounded-xl bg-background">
									<HoverProfileCard username={data.username} />
								</HoverCardContent>
							</HoverCard>
							{data.isGlimpseVerified && <VerifiedBadge className="size-4.5" />}
						</div>
						<p className="text-muted-foreground -mt-1">@{data.username}</p>
					</div>
				</div>
				{action}
			</div>
		</div>
	);
};

export default ProfileCard;
