import { CheckmarkBadge02Icon, UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import SidebarOptions from "./SidebarOptions";

function SidebarProfile() {
	return (
		<>
			{/* Profile */}
			<div className="flex flex-col gap-4 justify-center items-center w-full p-2">
				<Avatar className="w-48 h-48">
					<AvatarImage src="https://github.com/aditsuru.png" alt="@shadcn" />
					<AvatarFallback>
						<HugeiconsIcon icon={UserIcon} size={48} />
					</AvatarFallback>
				</Avatar>
				<div className="flex flex-col items-center justify-center w-full gap-4">
					{/* Name */}
					<div className="flex flex-col items-center justify-center ">
						<div className="flex gap-2 justify-center items-center">
							<h1 className="text-2xl font-semibold">User Name</h1>
							<HugeiconsIcon
								icon={CheckmarkBadge02Icon}
								size={28}
								className="text-primary shrink-0 translate-y-px"
							/>
						</div>
						<h2 className="text-base text-muted-foreground">@username</h2>
					</div>
					{/* Stats */}
					<div className="flex justify-between w-full">
						<div className="flex flex-col gap-2 text-lg text-center">
							<p className="font-semibold">472</p>
							<p className="text-muted-foreground">Posts</p>
						</div>
						<Separator orientation="vertical" className="h-8!" />
						<div className="flex flex-col gap-2 text-lg text-center">
							<p className="font-semibold">12.4K</p>
							<p className="text-muted-foreground">Followers</p>
						</div>
						<Separator orientation="vertical" className="h-8!" />
						<div className="flex flex-col gap-2 text-lg text-center">
							<p className="font-semibold">228</p>
							<p className="text-muted-foreground">Following</p>
						</div>
					</div>
					{/* Bio */}
					<div>
						<p className="w-full line-clamp-12">
							Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempore
							neque amet perferendis excepturi laborum repudiandae quod in velit
							praesentium placeat?.
						</p>
					</div>
				</div>
			</div>
			{/* Options */}
			<SidebarOptions />
		</>
	);
}

export default SidebarProfile;
