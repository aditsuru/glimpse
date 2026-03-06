import { CheckmarkBadge02Icon, UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import MyVideoPlayer from "./MyVideoPlayer";
import { AspectRatio } from "./ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";

type post = {
	type: "image" | "video" | "text";
	url: string;
	body: string;
	userAvatar: string;
	username: string;
	authorName: string;
	createAt: string;
};

function PostCard() {
	return (
		<div className="p-2">
			<div className="flex gap-4 items-start flex-col lg:flex-row">
				<div className="flex gap-4 items-start">
					<Avatar className="w-10 h-10">
						<AvatarImage src="https://github.com/aditsuru.png" alt="@shadcn" />
						<AvatarFallback>
							<HugeiconsIcon icon={UserIcon} />
						</AvatarFallback>
					</Avatar>
					<p className="lg:hidden font-semibold text-lg">Lorem, ipsum.</p>
				</div>
				<div className="flex flex-col gap-4">
					<div>
						<div className="hidden lg:flex gap-2 items-center">
							<p className="text-lg font-semibold">Lorem, ipsum.</p>
							<HugeiconsIcon
								icon={CheckmarkBadge02Icon}
								size={24}
								className="text-primary shrink-0 translate-y-px"
							/>
						</div>
						<p>
							Lorem ipsum dolor sit amet consectetur, adipisicing elit. Natus,
							libero. Quas soluta delectus ducimus, ratione debitis distinctio!
							Ratione esse alias fugiat veritatis qui! Voluptatibus laboriosam
							veritatis tempora? Autem suscipit, libero dignissimos ullam id in.
						</p>
					</div>
					<AspectRatio ratio={16 / 9} className="w-full h-full rounded">
						<Image src="/image1.gif" alt="post" fill className="rounded" />
					</AspectRatio>
				</div>
			</div>
		</div>
	);
}

export default PostCard;
