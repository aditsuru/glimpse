import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import SidebarOptions from "./SidebarOptions";

function SidebarProfile() {
	return (
		<div className="hidden lg:flex flex-col col-span-1 min-h-full bg-background rounded-3xl px-6">
			{/* Profile */}
			<div className="flex flex-col gap-4 justify-center items-center mt-12 w-full">
				<Avatar className="w-48 h-48">
					<AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
					<AvatarFallback>CN</AvatarFallback>
				</Avatar>
				<div className="flex flex-col items-center justify-center w-full gap-4">
					{/* Name */}
					<div className="flex flex-col items-center justify-center ">
						<h1 className="text-2xl font-semibold">User Name</h1>
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
							Lorem ipsum dolor, sit amet consectetur adipisicing elit. Maiores
							cumque consectetur nobis odit ab, veniam dolorem omnis repellat
							vel, accusantium amet asperiores voluptate. Lorem ipsum dolor sit
							amet consectetur, adipisicing elit. Voluptatem exercitationem
							debitis praesentium, dolorum ratione vitae ipsa, soluta blanditiis
							modi totam quis? Consequatur similique vero quos quam perspiciatis
							excepturi molestias, delectus, laborum numquam blanditiis,
							accusamus hic? Eum nostrum perferendis blanditiis voluptatem?
							Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda
							placeat eligendi quo in, porro, sunt quibusdam veniam dignissimos
							labore earum quae maxime consequatur sint! In magni iure, delectus
							sint dolores nobis! Enim hic tenetur cum minus et aliquam eos
							recusandae nemo, repellat aut ut deleniti quod expedita laudantium
							dolorem error! Aut saepe totam nisi ipsum at nulla dolores, nobis
							explicabo.
						</p>
					</div>
				</div>
			</div>
			{/* Options */}
			<SidebarOptions />
		</div>
	);
}

export default SidebarProfile;
