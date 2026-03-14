import { CheckmarkBadge02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Separator } from "@/components/ui/separator";
import InteractiveSidebarPfp from "./InteractiveSidebarPfp";
import SidebarOptions from "./SidebarOptions";

function SidebarProfile() {
	return (
		<>
			{/* Profile */}
			<div className="flex flex-col gap-4 justify-center items-center w-full p-2">
				<InteractiveSidebarPfp />

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
					<div className="flex items-center justify-center w-full py-4 border-y lg:border-none">
						{/* Posts */}
						<div className="flex flex-col items-center flex-1">
							<span className="text-xl font-bold leading-none">472</span>
							<span className="text-sm text-muted-foreground mt-1">Posts</span>
						</div>

						<Separator orientation="vertical" className="h-8" />

						{/* Followers */}
						<div className="flex flex-col items-center flex-1">
							<span className="text-xl font-bold leading-none">12.4K</span>
							<span className="text-sm text-muted-foreground mt-1">
								Followers
							</span>
						</div>

						<Separator orientation="vertical" className="h-8" />

						{/* Following */}
						<div className="flex flex-col items-center flex-1">
							<span className="text-xl font-bold leading-none">228</span>
							<span className="text-sm text-muted-foreground mt-1">
								Following
							</span>
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
