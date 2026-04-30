import Image from "next/image";
import Link from "next/link";
import { VerifiedBadge } from "@/components/misc/VerifiedBadge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DEFAULT_PFP_URL } from "@/lib/shared/constants";

const ProfileSidebar = ({
	avatarUrl,
	displayName,
	username,
	bio,
	pronouns,
}: {
	avatarUrl?: string;
	bannerUrl?: string;
	displayName: string;
	bannerMimeType?: string;
	username: string;
	bio?: string;
	pronouns?: string;
	isGlimpseVerified: boolean;
}) => {
	const bannerUrl = "/static/temp/image4.jpg";
	return (
		<div className="h-full w-full mt-8 px-8 rounded-md">
			<div className="h-full w-full flex flex-col justify-between gap-4  bg-cover bg-center">
				<div className="pt-8 px-4">
					<div className="  flex flex-col items-center gap-6 h-[180px]">
						<Avatar className="w-45 h-45 border-4 border-accent">
							<AvatarImage src={bannerUrl} />
							<AvatarFallback>
								<AvatarImage src={DEFAULT_PFP_URL} />
							</AvatarFallback>
						</Avatar>
						<div className="font-mono flex flex-col w-full">
							<div className="flex gap-1 items-center">
								<h1 className="text-2xl">{displayName}</h1>
								<VerifiedBadge size={24} />
							</div>
							<div className="flex gap-3">
								<Link href={`/${username}`} className="w-auto">
									<h2 className="inline-block hover:underline hover:underline-offset-4 text-muted-foreground">
										@{username}
									</h2>
								</Link>
								<p className="text-muted-foreground">~ {pronouns}</p>
							</div>
							<div className="flex gap-4">
								<p>
									12 <span className="text-muted-foreground">Followers</span>
								</p>
								<p>
									12 <span className="text-muted-foreground">Following</span>
								</p>
							</div>
							<div className="flex-1 overflow-hidden mt-4">
								{bio ? (
									<p className="line-clamp-4">{bio}</p>
								) : (
									<p className="text-muted-foreground">No bio yet.</p>
								)}
							</div>
						</div>
					</div>
				</div>
				<div className=" w-full flex-1 p-8">
					<div className=" h-full">
						<AspectRatio ratio={16 / 9} className="border-4 border-accent">
							<Image
								src={bannerUrl}
								alt="Banner"
								className="object-cover w-full h-full"
								width={500}
								height={500}
								priority
							/>
						</AspectRatio>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfileSidebar;
