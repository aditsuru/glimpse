import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
		<div className="hidden lg:flex flex-col col-span-1 h-full overflow-y-auto rounded-3xl  bg-background ">
			<div className="mt-12 flex flex-col items-center gap-4 h-full w-full">
				{/* Search */}
				<InputGroup className="max-w-xs">
					<InputGroupInput
						placeholder="Search a user..."
						className="cursor-none"
					/>
					<InputGroupAddon>
						<HugeiconsIcon icon={Search01Icon} />
					</InputGroupAddon>
				</InputGroup>
				{/* Results */}
				<div className="overflow-y-auto flex-1 w-full px-4">
					<ItemGroup className="w-full transition-all duration-150 hover:scale-105">
						<Item className="flex">
							<ItemMedia>
								<Avatar className="w-10 h-10">
									<AvatarImage src="https://github.com/shadcn.png" />
									<AvatarFallback>LM</AvatarFallback>
								</Avatar>
							</ItemMedia>
							<ItemContent className="flex flex-col gap-0">
								<ItemTitle>Lorem, ipsum.</ItemTitle>
								<ItemDescription>Lorem, ipsum.</ItemDescription>
							</ItemContent>
							<ItemActions>
								<Button
									variant="ghost"
									className="hover:bg-background cursor-none transition-all duration-150"
								>
									Follow
								</Button>
							</ItemActions>
						</Item>
					</ItemGroup>
				</div>
			</div>
		</div>
	);
}

export default SidebarSearch;
