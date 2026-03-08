import {
	CheckmarkBadge02Icon,
	Search01Icon,
	UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";

function SidebarSearch() {
	return (
		<div className="flex flex-col items-center gap-4 w-full flex-1 min-h-0 pt-2">
			{/* Search */}
			<InputGroup className="max-w-xs">
				<InputGroupInput placeholder="Search a user" className="" />
				<InputGroupAddon className="">
					<HugeiconsIcon icon={Search01Icon} />
				</InputGroupAddon>
			</InputGroup>
			{/* Results */}
			<div className="flex-1 w-full px-4 overflow-y-auto custom-scrollbar">
				<Link href="/profile/aditsuru" className="">
					<ItemGroup className="w-full transition-all duration-150 hover:scale-105 hover:grayscale">
						<Item className="flex">
							<ItemMedia className="flex items-center justify-center">
								<Avatar className="w-10 h-10">
									<AvatarImage src="https://github.com/aditsuru.png" />
									<AvatarFallback>
										<HugeiconsIcon icon={UserIcon} />
									</AvatarFallback>
								</Avatar>
							</ItemMedia>
							<ItemContent className="flex flex-col gap-0 w-full">
								<div className="flex gap-1 items-start">
									<ItemTitle>Lorem, ipsum.</ItemTitle>
									<HugeiconsIcon
										icon={CheckmarkBadge02Icon}
										size={18}
										className="text-primary shrink-0 translate-y-px"
									/>
								</div>
								<ItemDescription>Lorem, ipsum.</ItemDescription>
							</ItemContent>
							<ItemActions>
								<p className="hidden xl:block hover:brightness-75  transition-all duration-150 font-medium">
									Follow
								</p>
							</ItemActions>
						</Item>
					</ItemGroup>
				</Link>
			</div>
		</div>
	);
}

export default SidebarSearch;
