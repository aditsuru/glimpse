import {
	Home01Icon,
	PlusSignCircleIcon,
	Settings01Icon,
	UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function Home() {
	return (
		<div className="w-screen h-screen lg:p-4  text-foreground">
			<div className="grid grid-cols-1 lg:grid-cols-4 w-full h-full gap-8 relative">
				{/* sidebar */}
				<div className="hidden lg:flex flex-col col-span-1 min-h-full bg-background rounded-4xl px-2">
					{/* Profile */}
					<div className="flex flex-col gap-4 justify-center items-center mt-12 w-full">
						<Avatar className="w-48 h-48">
							<AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
							<AvatarFallback>CN</AvatarFallback>
						</Avatar>
						<div className="flex flex-col items-center justify-center w-full gap-4">
							<div className="flex flex-col items-center justify-center ">
								<h1 className="text-2xl font-semibold">User Name</h1>
								<h2 className="text-base text-muted-foreground">@username</h2>
							</div>
							<div className="flex justify-around gap-2 w-full ">
								<div className="flex flex-col gap-2 text-lg text-center">
									<p className="font-semibold">472</p>
									<p>Posts</p>
								</div>
								<Separator orientation="vertical" className="max-h-8" />
								<div className="flex flex-col gap-2 text-lg text-center">
									<p className="font-semibold">12.4K</p>
									<p>Followers</p>
								</div>
								<Separator orientation="vertical" className="max-h-8" />
								<div className="flex flex-col gap-2 text-lg text-center">
									<p className="font-semibold">228</p>
									<p>Following</p>
								</div>
							</div>
							<div>
								<p className="px-4 w-full ">
									Lorem ipsum dolor, sit amet consectetur adipisicing elit.
									Maiores cumque consectetur nobis odit ab, veniam dolorem omnis
									repellat vel, accusantium amet asperiores voluptate.
								</p>
							</div>
						</div>
					</div>
					{/* Options */}
					<div className="flex flex-col items-start gap-4 w-full pb-4 px-4 mt-auto">
						<div className="flex gap-2 items-center">
							<HugeiconsIcon icon={Home01Icon} size={28} />
							<p className="text-lg font-semibold">Feed</p>
						</div>
						<div className="flex gap-2 items-center">
							<HugeiconsIcon icon={PlusSignCircleIcon} size={28} />
							<p className="text-lg font-semibold">Create</p>
						</div>
						<div className="flex gap-2 items-center">
							<HugeiconsIcon icon={UserIcon} size={28} />
							<p className="text-lg font-semibold">Profile</p>
						</div>
						<div className="flex gap-2 items-center">
							<HugeiconsIcon icon={Settings01Icon} size={28} />
							<p className="text-lg font-semibold">Settings</p>
						</div>
					</div>
				</div>

				{/* feed */}
				<div className="col-span-3 min-h-full w-full bg-background lg:brightness-95 lg:rounded-4xl"></div>
				{/* Options */}
				<div className="lg:hidden col-span-1 absolute bottom-0 w-full background flex justify-between items-center p-4 px-8 border-t-4 border-primary">
					<HugeiconsIcon icon={Home01Icon} size={32} />

					<HugeiconsIcon icon={PlusSignCircleIcon} size={32} />

					<HugeiconsIcon icon={UserIcon} size={32} />

					<HugeiconsIcon icon={Settings01Icon} size={32} />
				</div>
			</div>
		</div>
	);
}
