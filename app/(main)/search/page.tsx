"use client";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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

function Search() {
	const router = useRouter();
	useEffect(() => {
		if (window.innerWidth >= 1024) {
			router.push("/");
		}
	}, [router]);

	return (
		<div className="mt-8 flex flex-col items-center gap-4 w-full flex-1 min-h-0">
			{/* Search */}
			<InputGroup className="max-w-sm">
				<InputGroupInput placeholder="Search a user" className="cursor-none" />
				<InputGroupAddon>
					<HugeiconsIcon icon={Search01Icon} />
				</InputGroupAddon>
			</InputGroup>
			{/* Results */}
			<div className="flex-1 w-full px-4 overflow-y-auto custom-scrollbar flex justify-center items-center flex-col">
				<ItemGroup className="w-full max-w-lg  transition-all duration-150 hover:scale-105 hover:grayscale">
					<Item className="flex">
						<ItemMedia className="flex items-center justify-center">
							<Avatar className="w-10 h-10">
								<AvatarImage src="https://github.com/shadcn.png" />
								<AvatarFallback>LM</AvatarFallback>
							</Avatar>
						</ItemMedia>
						<ItemContent className="flex flex-col gap-0 w-full">
							<ItemTitle>Lorem, ipsum.</ItemTitle>
							<ItemDescription>Lorem, ipsum.</ItemDescription>
						</ItemContent>
						<ItemActions>
							<Button
								variant="ghost"
								className="hover:bg-background hover:text-accent cursor-none transition-all duration-150 font-medium"
							>
								Follow
							</Button>
						</ItemActions>
					</Item>
				</ItemGroup>
			</div>
		</div>
	);
}

export default Search;
