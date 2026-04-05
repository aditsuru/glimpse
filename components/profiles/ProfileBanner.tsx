import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";

interface ProfileBannerProps {
	bannerUrl: string;
	avatarUrl: string;
	name: string;
}

export function ProfileBanner({
	bannerUrl,
	avatarUrl,
	name,
}: ProfileBannerProps) {
	return (
		<div className="relative mb-16">
			<AspectRatio ratio={4 / 1} className="bg-muted">
				<Image
					src={bannerUrl}
					alt="Banner"
					fill
					className="object-cover"
					priority
				/>
			</AspectRatio>

			<div className="absolute -bottom-14 px-4">
				<Avatar className="h-28 w-28 border-background ring-1 ring-foreground/10">
					<AvatarImage src={avatarUrl} alt={name} />
					<AvatarFallback className="text-2xl">{initials(name)}</AvatarFallback>
				</Avatar>
			</div>
		</div>
	);
}
